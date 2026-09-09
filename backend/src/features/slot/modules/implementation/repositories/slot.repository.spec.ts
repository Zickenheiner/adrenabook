import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SlotRepository } from './slot.repository';
import { SlotMapper } from '../mappers/slot.mapper';
import { SlotEntity } from '@features/slot/domains/entities/slot.entity';
import { CreateSlotsDto } from '@features/slot/domains/dtos/slot.dto';

// Fabrique un maillon de chaine Mongoose terminee par exec()
const chain = (value: unknown) => ({
  exec: jest.fn().mockResolvedValue(value),
});

// find().select().exec() : projection puis execution
const selectChain = (value: unknown) => {
  const link = {
    select: jest.fn(),
    exec: jest.fn().mockResolvedValue(value),
  };
  link.select.mockReturnValue(link);
  return link;
};

const VALID_ID = '68b4d59919d9b7a94b4fde21';
const OTHER_ID = '68b4d59919d9b7a94b4fde22';

describe('SlotRepository', () => {
  let repository: SlotRepository;
  let slotModel: jest.Mock & Record<string, jest.Mock>;
  let bookingModel: Record<string, jest.Mock>;
  let activityModel: Record<string, jest.Mock>;
  let centerModel: Record<string, jest.Mock>;
  let mapper: { toEntity: jest.Mock };
  let saveMock: jest.Mock;

  beforeEach(async () => {
    saveMock = jest.fn().mockImplementation(function (this: { _id: string }) {
      return Promise.resolve({ _id: 'slot-saved' });
    });

    slotModel = jest.fn().mockImplementation((payload: unknown) => ({
      ...(payload as Record<string, unknown>),
      save: saveMock,
    })) as unknown as jest.Mock & Record<string, jest.Mock>;
    slotModel.findById = jest.fn();
    slotModel.find = jest.fn();

    bookingModel = { countDocuments: jest.fn() };
    activityModel = { findById: jest.fn() };
    centerModel = { findById: jest.fn() };

    mapper = {
      toEntity: jest.fn(
        (doc: { _id: string }) => new SlotEntity(doc._id as never),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlotRepository,
        { provide: getModelToken('Slot'), useValue: slotModel },
        { provide: getModelToken('Booking'), useValue: bookingModel },
        { provide: getModelToken('Activity'), useValue: activityModel },
        { provide: getModelToken('ProfessionalCenter'), useValue: centerModel },
        { provide: SlotMapper, useValue: mapper },
      ],
    }).compile();

    repository = module.get<SlotRepository>(SlotRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById()', () => {
    it('should return null without querying when the id is not a valid ObjectId', async () => {
      const result = await repository.findById('not-an-id');

      expect(result).toBeNull();
      expect(slotModel.findById).not.toHaveBeenCalled();
    });

    it('should map the found slot', async () => {
      slotModel.findById.mockReturnValue(chain({ _id: VALID_ID }));

      const result = await repository.findById(VALID_ID);

      expect(slotModel.findById).toHaveBeenCalledWith(VALID_ID);
      expect(result?.getId()).toBe(VALID_ID);
    });

    it('should return null when the slot does not exist', async () => {
      slotModel.findById.mockReturnValue(chain(null));

      await expect(repository.findById(VALID_ID)).resolves.toBeNull();
    });
  });

  describe('countActiveBookings()', () => {
    it('should count the bookings of the slot excluding the cancelled ones', async () => {
      bookingModel.countDocuments.mockReturnValue(chain(4));

      const result = await repository.countActiveBookings(VALID_ID);

      expect(result).toBe(4);
      const filter = bookingModel.countDocuments.mock.calls[0][0] as {
        slotId: mongoose.Types.ObjectId;
        status: { $ne: string };
      };
      expect(filter.slotId.toString()).toBe(VALID_ID);
      expect(filter.status).toEqual({ $ne: 'cancelled' });
    });

    it('should return zero when the slot has no booking', async () => {
      bookingModel.countDocuments.mockReturnValue(chain(0));

      await expect(repository.countActiveBookings(VALID_ID)).resolves.toBe(0);
    });

    it('should throw when the slot id is not a valid ObjectId', async () => {
      await expect(repository.countActiveBookings('nope')).rejects.toThrow();
    });
  });

  describe('findByActivityId()', () => {
    it('should map every slot of the activity', async () => {
      slotModel.find.mockReturnValue(chain([{ _id: 'a' }, { _id: 'b' }]));

      const result = await repository.findByActivityId(VALID_ID);

      expect(slotModel.find).toHaveBeenCalledWith({ activityId: VALID_ID });
      expect(result).toHaveLength(2);
    });

    it('should return null when the model resolves to null', async () => {
      slotModel.find.mockReturnValue(chain(null));

      await expect(repository.findByActivityId(VALID_ID)).resolves.toBeNull();
    });
  });

  describe('findActivityOwnership()', () => {
    it('should return null without querying when the activity id is invalid', async () => {
      const result = await repository.findActivityOwnership('bad-id');

      expect(result).toBeNull();
      expect(activityModel.findById).not.toHaveBeenCalled();
    });

    it('should return null when the activity does not exist', async () => {
      activityModel.findById.mockReturnValue(selectChain(null));

      const result = await repository.findActivityOwnership(VALID_ID);

      expect(result).toBeNull();
      expect(centerModel.findById).not.toHaveBeenCalled();
    });

    it('should return the owner id of the center hosting the activity', async () => {
      activityModel.findById.mockReturnValue(
        selectChain({ centerId: OTHER_ID }),
      );
      centerModel.findById.mockReturnValue(
        selectChain({ ownerId: { toString: () => 'owner-1' } }),
      );

      const result = await repository.findActivityOwnership(VALID_ID);

      expect(centerModel.findById).toHaveBeenCalledWith(OTHER_ID);
      expect(result).toEqual({ ownerId: 'owner-1' });
    });

    it('should return a null ownerId when the center is missing', async () => {
      activityModel.findById.mockReturnValue(
        selectChain({ centerId: OTHER_ID }),
      );
      centerModel.findById.mockReturnValue(selectChain(null));

      const result = await repository.findActivityOwnership(VALID_ID);

      expect(result).toEqual({ ownerId: null });
    });
  });

  describe('createMany()', () => {
    const dto: CreateSlotsDto = {
      durationMinutes: 120,
      maxParticipants: 8,
      priceEur: 90,
      instructorIds: ['instructor-1'],
    } as CreateSlotsDto;

    it('should instantiate and save one document per start date', async () => {
      const dates = [
        new Date('2026-06-01T09:00:00.000Z'),
        new Date('2026-06-02T09:00:00.000Z'),
      ];

      const result = await repository.createMany(VALID_ID, dto, dates);

      expect(slotModel).toHaveBeenCalledTimes(2);
      expect(saveMock).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);

      const payload = slotModel.mock.calls[0][0] as {
        activityId: mongoose.Types.ObjectId;
        startAt: Date;
        durationMinutes: number;
        maxParticipants: number;
        priceEur: number;
        instructorIds: string[];
      };
      expect(payload.activityId.toString()).toBe(VALID_ID);
      expect(payload.startAt).toEqual(dates[0]);
      expect(payload.durationMinutes).toBe(120);
      expect(payload.maxParticipants).toBe(8);
      expect(payload.priceEur).toBe(90);
      expect(payload.instructorIds).toEqual(['instructor-1']);
    });

    it('should carry the recurrence rule over to every document', async () => {
      const recurrence = {
        rrule: 'FREQ=WEEKLY',
        untilDate: '2026-07-01',
      };

      await repository.createMany(
        VALID_ID,
        { ...dto, recurrence } as CreateSlotsDto,
        [new Date('2026-06-01T09:00:00.000Z')],
      );

      const payload = slotModel.mock.calls[0][0] as {
        recurrence: typeof recurrence;
      };
      expect(payload.recurrence).toEqual(recurrence);
    });

    it('should return an empty array when no start date is provided', async () => {
      const result = await repository.createMany(VALID_ID, dto, []);

      expect(result).toEqual([]);
      expect(slotModel).not.toHaveBeenCalled();
    });

    it('should propagate a save failure', async () => {
      saveMock.mockRejectedValue(new Error('duplicate slot'));

      await expect(
        repository.createMany(VALID_ID, dto, [new Date()]),
      ).rejects.toThrow('duplicate slot');
    });
  });
});
