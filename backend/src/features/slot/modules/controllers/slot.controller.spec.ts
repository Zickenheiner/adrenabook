import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SlotController } from './slot.controller';
import { ISlotService } from '@features/slot/interfaces/services/slot.iservice';
import {
  CreateSlotsDto,
  CreateSlotsResponseDto,
  ProSlotListItemDto,
} from '@features/slot/domains/dtos/slot.dto';

describe('SlotController', () => {
  let controller: SlotController;
  let slotService: jest.Mocked<ISlotService>;

  const activityId = '68b4d59919d9b7a94b4fde20';
  const proUserId = '68b4d59919d9b7a94b4fde10';

  type RequestUser = { user: { sub: string; role: string } };

  // Requete authentifiee telle que fournie par le guard JWT
  const buildRequest = (
    role = 'professionnel',
    sub: string = proUserId,
  ): RequestUser => ({ user: { sub, role } });

  const dto: CreateSlotsDto = {
    singleStartAt: '2026-06-15T09:00:00.000Z',
    maxParticipants: 10,
    instructorIds: ['68b4d59919d9b7a94b4fde11'],
  };

  beforeEach(async () => {
    const slotServiceMock: jest.Mocked<ISlotService> = {
      findDetailById: jest.fn(),
      findByActivityIdForOwner: jest.fn(),
      updateSlotForOwner: jest.fn(),
      deleteSlotForOwner: jest.fn(),
      createSlots: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlotController],
      providers: [
        {
          provide: 'ISlotService',
          useValue: slotServiceMock,
        },
      ],
    }).compile();

    controller = module.get<SlotController>(SlotController);
    slotService = module.get('ISlotService');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateSlot() / deleteSlot()', () => {
    const slotId = '68b4d59919d9b7a94b4fde99';

    it('should forward the changes for a professional user', async () => {
      slotService.updateSlotForOwner.mockResolvedValue(true);

      const result = await controller.updateSlot(
        activityId,
        slotId,
        { maxParticipants: 12 },
        buildRequest(),
      );

      expect(result).toBe(true);
      expect(slotService.updateSlotForOwner).toHaveBeenCalledWith(
        activityId,
        slotId,
        proUserId,
        { maxParticipants: 12 },
      );
    });

    it('should forward the deletion for a professional user', async () => {
      slotService.deleteSlotForOwner.mockResolvedValue(true);

      const result = await controller.deleteSlot(
        activityId,
        slotId,
        buildRequest(),
      );

      expect(result).toBe(true);
      expect(slotService.deleteSlotForOwner).toHaveBeenCalledWith(
        activityId,
        slotId,
        proUserId,
      );
    });

    it('should refuse a non professional role on update', async () => {
      await expect(
        controller.updateSlot(
          activityId,
          slotId,
          {},
          buildRequest('aventurier'),
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(slotService.updateSlotForOwner).not.toHaveBeenCalled();
    });

    it('should refuse a non professional role on delete', async () => {
      await expect(
        controller.deleteSlot(activityId, slotId, buildRequest('aventurier')),
      ).rejects.toThrow(ForbiddenException);
      expect(slotService.deleteSlotForOwner).not.toHaveBeenCalled();
    });
  });

  describe('createSlots()', () => {
    const expected: CreateSlotsResponseDto = {
      createdCount: 1,
      slots: [
        { id: '68b4d59919d9b7a94b4fde21', startAt: '2026-06-15T09:00:00.000Z' },
      ],
      conflicts: [],
    };

    it('should create the slots for a professional user', async () => {
      slotService.createSlots.mockResolvedValue(expected);

      const result = await controller.createSlots(
        activityId,
        dto,
        buildRequest(),
      );

      expect(result).toEqual(expected);
      expect(slotService.createSlots).toHaveBeenCalledWith(
        activityId,
        proUserId,
        dto,
      );
    });

    it('should return the conflicts reported by the service', async () => {
      slotService.createSlots.mockResolvedValue({
        createdCount: 0,
        slots: [],
        conflicts: [
          {
            startAt: '2026-06-15T09:00:00.000Z',
            reason: 'Un créneau existe déjà à cette date/heure',
          },
        ],
      });

      const result = await controller.createSlots(
        activityId,
        dto,
        buildRequest(),
      );

      expect(result.createdCount).toBe(0);
      expect(result.conflicts).toHaveLength(1);
    });

    it('should throw a ForbiddenException when the role is not "professionnel"', async () => {
      await expect(
        controller.createSlots(activityId, dto, buildRequest('particulier')),
      ).rejects.toThrow(ForbiddenException);
      expect(slotService.createSlots).not.toHaveBeenCalled();
    });

    it('should throw a ForbiddenException when the request carries no user', async () => {
      const req = {} as RequestUser;

      await expect(
        controller.createSlots(activityId, dto, req),
      ).rejects.toThrow(ForbiddenException);
      expect(slotService.createSlots).not.toHaveBeenCalled();
    });

    it('should propagate a NotFoundException when the activity does not exist', async () => {
      slotService.createSlots.mockRejectedValue(
        new NotFoundException('Activité introuvable'),
      );

      await expect(
        controller.createSlots('unknown', dto, buildRequest()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should propagate a BadRequestException when the RRULE is invalid', async () => {
      slotService.createSlots.mockRejectedValue(
        new BadRequestException('RRULE invalide'),
      );

      await expect(
        controller.createSlots(activityId, dto, buildRequest()),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findSlots()', () => {
    const expected: ProSlotListItemDto[] = [
      {
        id: '68b4d59919d9b7a94b4fde21',
        startAt: '2026-06-15T09:00:00.000Z',
        durationMinutes: 60,
        maxParticipants: 10,
        remainingSeats: 8,
        priceEur: 150,
      },
    ];

    const payload = { slots: expected, availableMonths: ['2026-06'] };

    it('should return the slots of the requested month', async () => {
      slotService.findByActivityIdForOwner.mockResolvedValue(payload);

      const result = await controller.findSlots(
        activityId,
        buildRequest(),
        '2026-06',
      );

      expect(result).toEqual(payload);
      expect(slotService.findByActivityIdForOwner).toHaveBeenCalledWith(
        activityId,
        proUserId,
        '2026-06',
      );
    });

    it('should default to the current month when none is given', async () => {
      slotService.findByActivityIdForOwner.mockResolvedValue(payload);

      await controller.findSlots(activityId, buildRequest(), undefined);

      expect(slotService.findByActivityIdForOwner).toHaveBeenCalledWith(
        activityId,
        proUserId,
        new Date().toISOString().slice(0, 7),
      );
    });

    it.each(['juin', '2026-13', '2026-6'])(
      'should reject the malformed month %s',
      async (month) => {
        await expect(
          controller.findSlots(activityId, buildRequest(), month),
        ).rejects.toThrow(BadRequestException);
        expect(slotService.findByActivityIdForOwner).not.toHaveBeenCalled();
      },
    );

    it('should return an empty month when the activity has no slot', async () => {
      slotService.findByActivityIdForOwner.mockResolvedValue({
        slots: [],
        availableMonths: [],
      });

      const result = await controller.findSlots(activityId, buildRequest());

      expect(result.slots).toEqual([]);
    });

    it('should throw a ForbiddenException when the role is not "professionnel"', async () => {
      await expect(
        controller.findSlots(activityId, buildRequest('particulier')),
      ).rejects.toThrow(ForbiddenException);
      expect(slotService.findByActivityIdForOwner).not.toHaveBeenCalled();
    });

    it('should throw a ForbiddenException when the request carries no user', async () => {
      const req = {} as RequestUser;

      await expect(controller.findSlots(activityId, req)).rejects.toThrow(
        ForbiddenException,
      );
      expect(slotService.findByActivityIdForOwner).not.toHaveBeenCalled();
    });

    it('should propagate a ForbiddenException when the activity belongs to another professional', async () => {
      slotService.findByActivityIdForOwner.mockRejectedValue(
        new ForbiddenException(
          'Cette activité appartient à un autre professionnel',
        ),
      );

      await expect(
        controller.findSlots(activityId, buildRequest()),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should propagate a NotFoundException when the activity does not exist', async () => {
      slotService.findByActivityIdForOwner.mockRejectedValue(
        new NotFoundException('Activité introuvable'),
      );

      await expect(
        controller.findSlots('unknown', buildRequest()),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
