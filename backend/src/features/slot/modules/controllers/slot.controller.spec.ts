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
    durationMinutes: 60,
    maxParticipants: 10,
    priceEur: 150,
    instructorIds: ['68b4d59919d9b7a94b4fde11'],
  };

  beforeEach(async () => {
    const slotServiceMock: jest.Mocked<ISlotService> = {
      findDetailById: jest.fn(),
      findByActivityIdForOwner: jest.fn(),
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

    it('should return the slots of the activity for a professional user', async () => {
      slotService.findByActivityIdForOwner.mockResolvedValue(expected);

      const result = await controller.findSlots(activityId, buildRequest());

      expect(result).toEqual(expected);
      expect(slotService.findByActivityIdForOwner).toHaveBeenCalledWith(
        activityId,
        proUserId,
      );
    });

    it('should return an empty list when the activity has no slot', async () => {
      slotService.findByActivityIdForOwner.mockResolvedValue([]);

      const result = await controller.findSlots(activityId, buildRequest());

      expect(result).toEqual([]);
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
