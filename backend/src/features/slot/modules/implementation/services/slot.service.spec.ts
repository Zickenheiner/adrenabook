import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SlotService } from './slot.service';
import { ISlotRepository } from '@features/slot/interfaces/repositories/slot.irepository';
import { SlotEntity } from '@features/slot/domains/entities/slot.entity';
import { CreateSlotsDto } from '@features/slot/domains/dtos/slot.dto';

describe('SlotService', () => {
  let service: SlotService;
  let slotRepository: jest.Mocked<ISlotRepository>;

  const activityId = '68b4d59919d9b7a94b4fde20';
  const userId = '68b4d59919d9b7a94b4fde10';

  // Faux SlotEntity : seuls les getters consommes par le service sont exposes
  const buildSlot = (overrides?: {
    id?: string;
    activityId?: string;
    startAt?: string;
    durationMinutes?: number;
    maxParticipants?: number;
    priceEur?: number;
  }): SlotEntity => {
    const values = {
      id: '68b4d59919d9b7a94b4fde21',
      activityId,
      startAt: '2026-06-15T09:00:00.000Z',
      durationMinutes: 60,
      maxParticipants: 10,
      priceEur: 150,
      ...overrides,
    };

    return {
      getId: () => values.id,
      getActivityId: () => values.activityId,
      getStartAt: () => new Date(values.startAt),
      getDurationMinutes: () => values.durationMinutes,
      getMaxParticipants: () => values.maxParticipants,
      getPriceEur: () => values.priceEur,
    } as unknown as SlotEntity;
  };

  const baseDto: CreateSlotsDto = {
    singleStartAt: '2026-06-15T09:00:00.000Z',
    durationMinutes: 60,
    maxParticipants: 10,
    priceEur: 150,
    instructorIds: ['68b4d59919d9b7a94b4fde11'],
  };

  beforeEach(async () => {
    const slotRepositoryMock: jest.Mocked<ISlotRepository> = {
      findById: jest.fn(),
      countActiveBookings: jest.fn(),
      findByActivityId: jest.fn(),
      findActivityOwnership: jest.fn(),
      createMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlotService,
        {
          provide: 'ISlotRepository',
          useValue: slotRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<SlotService>(SlotService);
    slotRepository = module.get('ISlotRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findDetailById()', () => {
    it('should return the slot detail with the remaining seats', async () => {
      slotRepository.findById.mockResolvedValue(buildSlot());
      slotRepository.countActiveBookings.mockResolvedValue(3);

      const result = await service.findDetailById('68b4d59919d9b7a94b4fde21');

      expect(result).toEqual({
        id: '68b4d59919d9b7a94b4fde21',
        activityId,
        startAt: '2026-06-15T09:00:00.000Z',
        durationMinutes: 60,
        maxParticipants: 10,
        remainingSeats: 7,
        priceEur: 150,
      });
      expect(slotRepository.countActiveBookings).toHaveBeenCalledWith(
        '68b4d59919d9b7a94b4fde21',
      );
    });

    it('should return null when the slot does not exist', async () => {
      slotRepository.findById.mockResolvedValue(null);

      const result = await service.findDetailById('unknown');

      expect(result).toBeNull();
      expect(slotRepository.countActiveBookings).not.toHaveBeenCalled();
    });

    it('should never return a negative number of remaining seats', async () => {
      slotRepository.findById.mockResolvedValue(
        buildSlot({ maxParticipants: 2 }),
      );
      slotRepository.countActiveBookings.mockResolvedValue(5);

      const result = await service.findDetailById('68b4d59919d9b7a94b4fde21');

      expect(result?.remainingSeats).toBe(0);
    });
  });

  describe('findByActivityIdForOwner()', () => {
    it('should return the slots sorted by ascending start date', async () => {
      slotRepository.findActivityOwnership.mockResolvedValue({
        ownerId: userId,
      });
      slotRepository.findByActivityId.mockResolvedValue([
        buildSlot({ id: 'late', startAt: '2026-07-01T09:00:00.000Z' }),
        buildSlot({ id: 'early', startAt: '2026-06-01T09:00:00.000Z' }),
        buildSlot({ id: 'middle', startAt: '2026-06-15T09:00:00.000Z' }),
      ]);
      slotRepository.countActiveBookings.mockResolvedValue(2);

      const result = await service.findByActivityIdForOwner(activityId, userId);

      expect(result.map((s) => s.id)).toEqual(['early', 'middle', 'late']);
      expect(result[0]).toEqual({
        id: 'early',
        startAt: '2026-06-01T09:00:00.000Z',
        durationMinutes: 60,
        maxParticipants: 10,
        remainingSeats: 8,
        priceEur: 150,
      });
    });

    it('should omit activityId from the returned items', async () => {
      slotRepository.findActivityOwnership.mockResolvedValue({
        ownerId: userId,
      });
      slotRepository.findByActivityId.mockResolvedValue([buildSlot()]);
      slotRepository.countActiveBookings.mockResolvedValue(0);

      const result = await service.findByActivityIdForOwner(activityId, userId);

      expect(result[0]).not.toHaveProperty('activityId');
    });

    it('should return an empty list when the repository returns null', async () => {
      slotRepository.findActivityOwnership.mockResolvedValue({
        ownerId: userId,
      });
      slotRepository.findByActivityId.mockResolvedValue(null);

      const result = await service.findByActivityIdForOwner(activityId, userId);

      expect(result).toEqual([]);
      expect(slotRepository.countActiveBookings).not.toHaveBeenCalled();
    });

    it('should throw a NotFoundException when the activity does not exist', async () => {
      slotRepository.findActivityOwnership.mockResolvedValue(null);

      await expect(
        service.findByActivityIdForOwner('unknown', userId),
      ).rejects.toThrow(NotFoundException);
      expect(slotRepository.findByActivityId).not.toHaveBeenCalled();
    });

    it('should throw a ForbiddenException when the activity belongs to another professional', async () => {
      slotRepository.findActivityOwnership.mockResolvedValue({
        ownerId: 'another-owner',
      });

      await expect(
        service.findByActivityIdForOwner(activityId, userId),
      ).rejects.toThrow(ForbiddenException);
      expect(slotRepository.findByActivityId).not.toHaveBeenCalled();
    });

    it('should throw a ForbiddenException when the activity center has no owner', async () => {
      slotRepository.findActivityOwnership.mockResolvedValue({ ownerId: null });

      await expect(
        service.findByActivityIdForOwner(activityId, userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createSlots()', () => {
    it('should create a single slot when singleStartAt is provided', async () => {
      slotRepository.findByActivityId.mockResolvedValue([]);
      slotRepository.createMany.mockResolvedValue([
        buildSlot({ id: 'new-slot' }),
      ]);

      const result = await service.createSlots(activityId, userId, baseDto);

      expect(result).toEqual({
        createdCount: 1,
        slots: [{ id: 'new-slot', startAt: '2026-06-15T09:00:00.000Z' }],
        conflicts: [],
      });
      expect(slotRepository.createMany).toHaveBeenCalledWith(
        activityId,
        baseDto,
        [new Date('2026-06-15T09:00:00.000Z')],
      );
    });

    it('should tolerate a null list of existing slots', async () => {
      slotRepository.findByActivityId.mockResolvedValue(null);
      slotRepository.createMany.mockResolvedValue([
        buildSlot({ id: 'new-slot' }),
      ]);

      const result = await service.createSlots(activityId, userId, baseDto);

      expect(result.createdCount).toBe(1);
    });

    it('should report a conflict and create nothing when the slot already exists', async () => {
      slotRepository.findByActivityId.mockResolvedValue([
        buildSlot({ startAt: '2026-06-15T09:00:00.000Z' }),
      ]);

      const result = await service.createSlots(activityId, userId, baseDto);

      expect(result).toEqual({
        createdCount: 0,
        slots: [],
        conflicts: [
          {
            startAt: '2026-06-15T09:00:00.000Z',
            reason: 'Un créneau existe déjà à cette date/heure',
          },
        ],
      });
      expect(slotRepository.createMany).not.toHaveBeenCalled();
    });

    it('should expand a recurrence rule up to untilDate', async () => {
      slotRepository.findByActivityId.mockResolvedValue([]);
      slotRepository.createMany.mockImplementation((_id, _dto, dates) =>
        Promise.resolve(
          dates.map((date, index) =>
            buildSlot({ id: `slot-${index}`, startAt: date.toISOString() }),
          ),
        ),
      );

      const dto: CreateSlotsDto = {
        ...baseDto,
        singleStartAt: undefined,
        recurrence: {
          rrule: 'FREQ=WEEKLY;DTSTART=20260901T090000Z;BYDAY=TU',
          untilDate: '2026-09-30T00:00:00.000Z',
        },
      };

      const result = await service.createSlots(activityId, userId, dto);

      expect(result.createdCount).toBe(5);
      expect(result.slots[0].startAt).toBe('2026-09-01T09:00:00.000Z');
      expect(result.slots[4].startAt).toBe('2026-09-29T09:00:00.000Z');
      expect(result.conflicts).toEqual([]);
    });

    it('should fall back to a twelve month horizon without untilDate', async () => {
      slotRepository.findByActivityId.mockResolvedValue([]);
      slotRepository.createMany.mockImplementation((_id, _dto, dates) =>
        Promise.resolve(
          dates.map((date, index) =>
            buildSlot({ id: `slot-${index}`, startAt: date.toISOString() }),
          ),
        ),
      );

      const dto: CreateSlotsDto = {
        ...baseDto,
        singleStartAt: undefined,
        recurrence: { rrule: 'FREQ=WEEKLY;BYDAY=TU;BYHOUR=9;BYMINUTE=0' },
      };

      const result = await service.createSlots(activityId, userId, dto);

      // Une regle hebdomadaire sur un an : 52 ou 53 occurrences selon la date
      // de depart. L'essentiel est qu'elle soit bornee, et sur ~12 mois.
      expect(result.createdCount).toBeGreaterThanOrEqual(52);
      expect(result.createdCount).toBeLessThanOrEqual(53);

      const horizon = new Date();
      horizon.setFullYear(horizon.getFullYear() + 1);
      const last = new Date(result.slots[result.slots.length - 1].startAt);
      expect(last.getTime()).toBeLessThanOrEqual(horizon.getTime());
    });

    it('should split recurrence occurrences between creations and conflicts', async () => {
      slotRepository.findByActivityId.mockResolvedValue([
        buildSlot({ id: 'existing', startAt: '2026-09-08T09:00:00.000Z' }),
      ]);
      slotRepository.createMany.mockImplementation((_id, _dto, dates) =>
        Promise.resolve(
          dates.map((date, index) =>
            buildSlot({ id: `slot-${index}`, startAt: date.toISOString() }),
          ),
        ),
      );

      const dto: CreateSlotsDto = {
        ...baseDto,
        singleStartAt: undefined,
        recurrence: {
          rrule: 'FREQ=WEEKLY;DTSTART=20260901T090000Z;BYDAY=TU',
          untilDate: '2026-09-30T00:00:00.000Z',
        },
      };

      const result = await service.createSlots(activityId, userId, dto);

      expect(result.createdCount).toBe(4);
      expect(result.conflicts).toEqual([
        {
          startAt: '2026-09-08T09:00:00.000Z',
          reason: 'Un créneau existe déjà à cette date/heure',
        },
      ]);
    });

    it('should throw a BadRequestException when neither recurrence nor singleStartAt is provided', async () => {
      const dto = { ...baseDto, singleStartAt: undefined };

      await expect(
        service.createSlots(activityId, userId, dto),
      ).rejects.toThrow(BadRequestException);
      expect(slotRepository.findByActivityId).not.toHaveBeenCalled();
    });

    it('should throw a BadRequestException when singleStartAt is not a valid date', async () => {
      const dto = { ...baseDto, singleStartAt: 'not-a-date' };

      await expect(
        service.createSlots(activityId, userId, dto),
      ).rejects.toThrow('singleStartAt est une date invalide');
    });

    it('should throw a BadRequestException when untilDate is not a valid date', async () => {
      const dto: CreateSlotsDto = {
        ...baseDto,
        singleStartAt: undefined,
        recurrence: {
          rrule: 'FREQ=WEEKLY;DTSTART=20260901T090000Z;BYDAY=TU',
          untilDate: 'not-a-date',
        },
      };

      await expect(
        service.createSlots(activityId, userId, dto),
      ).rejects.toThrow('untilDate est une date invalide');
    });

    it('should throw a BadRequestException when the RRULE is invalid', async () => {
      const dto: CreateSlotsDto = {
        ...baseDto,
        singleStartAt: undefined,
        recurrence: {
          rrule: 'NOT_A_RRULE',
          untilDate: '2026-09-30T00:00:00.000Z',
        },
      };

      await expect(
        service.createSlots(activityId, userId, dto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createSlots(activityId, userId, dto),
      ).rejects.toThrow(/RRULE invalide/);
    });

    it('should prefer the recurrence over singleStartAt when both are provided', async () => {
      slotRepository.findByActivityId.mockResolvedValue([]);
      slotRepository.createMany.mockImplementation((_id, _dto, dates) =>
        Promise.resolve(
          dates.map((date, index) =>
            buildSlot({ id: `slot-${index}`, startAt: date.toISOString() }),
          ),
        ),
      );

      const dto: CreateSlotsDto = {
        ...baseDto,
        recurrence: {
          rrule: 'FREQ=DAILY;DTSTART=20260901T090000Z',
          untilDate: '2026-09-03T09:00:00.000Z',
        },
      };

      const result = await service.createSlots(activityId, userId, dto);

      expect(result.createdCount).toBe(3);
      expect(result.slots.map((s) => s.startAt)).not.toContain(
        '2026-06-15T09:00:00.000Z',
      );
    });
  });
});
