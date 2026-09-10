import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

// Le repository fait un require('stripe') au niveau module : le SDK est
// remplace par un constructeur mocke pour eviter tout appel reseau.
const mockStripe = {
  create: jest.fn(),
  constructorCalls: [] as unknown[][],
};

jest.mock('stripe', () =>
  jest.fn().mockImplementation((...args: unknown[]) => {
    mockStripe.constructorCalls.push(args);
    return {
      refunds: {
        create: (params: unknown) => mockStripe.create(params),
      },
    };
  }),
);

import { BookingRepository } from './booking.repository';
import { BookingMapper } from '../mappers/booking.mapper';
import { Booking } from '@features/booking/domains/schemas/booking.schema';
import { Slot } from '@features/slot/domains/schemas/slot.schema';
import { Activity } from '@features/activity/domains/schemas/activity.schema';
import { Waiver } from '@features/waiver/domains/schemas/waiver.schema';
import {
  CancelBookingDto,
  ConfirmPaymentDto,
  CreateBookingDto,
} from '@features/booking/domains/dtos/booking.dto';

/**
 * Query Mongoose chainable : select/populate/lean renvoient la meme instance,
 * exec() resout la valeur finale.
 */
interface ChainableQuery {
  select: jest.Mock;
  populate: jest.Mock;
  lean: jest.Mock;
  exec: jest.Mock;
}

const mockQuery = (result: unknown): ChainableQuery => {
  const query = {} as ChainableQuery;
  query.select = jest.fn(() => query);
  query.populate = jest.fn(() => query);
  query.lean = jest.fn(() => query);
  query.exec = jest.fn().mockResolvedValue(result);
  return query;
};

interface BookingModelMock extends jest.Mock {
  findById: jest.Mock;
  find: jest.Mock;
  countDocuments: jest.Mock;
  findByIdAndUpdate: jest.Mock;
}

describe('BookingRepository', () => {
  let repository: BookingRepository;
  let bookingModel: BookingModelMock;
  let slotModel: { findById: jest.Mock };
  let activityModel: { findById: jest.Mock };
  let waiverModel: { countDocuments: jest.Mock };
  let bookingMapper: { toEntity: jest.Mock };
  let saveMock: jest.Mock;

  const bookingId = new Types.ObjectId();
  const slotId = new Types.ObjectId();
  const activityId = new Types.ObjectId();
  const userId = new Types.ObjectId();

  // Date fixe : les seuils de remboursement se comptent en jours avant le slot
  const NOW = new Date('2026-08-20T12:00:00.000Z');

  const buildModule = async (
    stripeSecret: string | undefined = 'sk_test',
  ): Promise<TestingModule> =>
    Test.createTestingModule({
      providers: [
        BookingRepository,
        { provide: getModelToken(Booking.name), useValue: bookingModel },
        { provide: getModelToken(Slot.name), useValue: slotModel },
        { provide: getModelToken(Activity.name), useValue: activityModel },
        { provide: getModelToken(Waiver.name), useValue: waiverModel },
        { provide: BookingMapper, useValue: bookingMapper },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'STRIPE_SECRET_KEY' ? stripeSecret : undefined,
            ),
          },
        },
      ],
    }).compile();

  /**
   * Instancie le repository sans passer par le conteneur Nest.
   *
   * Sous `useFakeTimers`, l'instanciation faite par `compile()` est differee :
   * le constructeur peut donc s'executer apres les assertions du test, ce qui
   * faussait le compteur d'appels a Stripe. Construire l'objet directement rend
   * le moment de l'appel deterministe.
   */
  const buildRepository = (
    stripeSecret: string | undefined,
  ): BookingRepository =>
    new BookingRepository(
      bookingModel as never,
      slotModel as never,
      activityModel as never,
      waiverModel as never,
      bookingMapper as never,
      {
        get: (key: string) =>
          key === 'STRIPE_SECRET_KEY' ? stripeSecret : undefined,
      } as never,
    );

  beforeEach(async () => {
    jest.useFakeTimers({ now: NOW, doNotFake: ['nextTick'] });
    mockStripe.create.mockReset();
    mockStripe.constructorCalls = [];

    saveMock = jest.fn();

    bookingModel = jest.fn().mockImplementation((data: unknown) => ({
      ...(data as Record<string, unknown>),
      save: saveMock,
    })) as unknown as BookingModelMock;

    bookingModel.findById = jest.fn();
    bookingModel.find = jest.fn();
    bookingModel.countDocuments = jest.fn();
    bookingModel.findByIdAndUpdate = jest.fn();

    slotModel = { findById: jest.fn() };
    activityModel = { findById: jest.fn() };
    waiverModel = { countDocuments: jest.fn() };

    bookingMapper = {
      toEntity: jest.fn((doc: { _id: unknown }) => ({
        entityFor: String(doc._id),
      })),
    };

    const module = await buildModule();
    repository = module.get<BookingRepository>(BookingRepository);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('constructor', () => {
    it('should instantiate Stripe when the secret key is configured', () => {
      expect(mockStripe.constructorCalls).toHaveLength(1);
      expect(mockStripe.constructorCalls[0][0]).toBe('sk_test');
    });

    it('should not instantiate Stripe when the secret key is missing', () => {
      mockStripe.constructorCalls = [];

      buildRepository(undefined);

      expect(mockStripe.constructorCalls).toHaveLength(0);
    });
  });

  describe('create()', () => {
    const dto = {
      slotId: slotId.toString(),
      participants: [
        { firstName: 'Remi', lastName: 'Durand' },
        { firstName: 'Marie', lastName: 'Durand' },
      ],
      acceptCenterTerms: true,
    } as unknown as CreateBookingDto;

    it('should throw NotFoundException when the slot does not exist', async () => {
      slotModel.findById.mockReturnValue(mockQuery(null));

      await expect(repository.create(dto, userId.toString())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when there are not enough spots left', async () => {
      slotModel.findById.mockReturnValue(
        mockQuery({ _id: slotId, maxParticipants: 3, priceEur: 100 }),
      );
      bookingModel.countDocuments.mockReturnValue(mockQuery(2));

      await expect(repository.create(dto, userId.toString())).rejects.toThrow(
        ConflictException,
      );
    });

    it('should exclude cancelled bookings from the availability count', async () => {
      slotModel.findById.mockReturnValue(
        mockQuery({ _id: slotId, maxParticipants: 10, priceEur: 100 }),
      );
      bookingModel.countDocuments.mockReturnValue(mockQuery(0));
      saveMock.mockResolvedValue({ _id: bookingId });

      await repository.create(dto, userId.toString());

      expect(bookingModel.countDocuments).toHaveBeenCalledWith({
        slotId,
        status: { $ne: 'cancelled' },
      });
    });

    it('should compute the VAT and the total for every participant', async () => {
      slotModel.findById.mockReturnValue(
        mockQuery({ _id: slotId, maxParticipants: 10, priceEur: 100 }),
      );
      bookingModel.countDocuments.mockReturnValue(mockQuery(0));
      saveMock.mockResolvedValue({ _id: bookingId });

      await repository.create(dto, userId.toString());

      const payload = bookingModel.mock.calls[0][0] as {
        totalEur: number;
        vatEur: number;
        status: string;
        participants: unknown;
        acceptCenterTerms: boolean;
        reservationExpiresAt: Date;
      };
      expect(payload.vatEur).toBe(40);
      expect(payload.totalEur).toBe(240);
      expect(payload.status).toBe('pending_payment');
      expect(payload.participants).toEqual(dto.participants);
      expect(payload.acceptCenterTerms).toBe(true);
    });

    it('should give the reservation a 15 minute lifetime', async () => {
      slotModel.findById.mockReturnValue(
        mockQuery({ _id: slotId, maxParticipants: 10, priceEur: 100 }),
      );
      bookingModel.countDocuments.mockReturnValue(mockQuery(0));
      saveMock.mockResolvedValue({ _id: bookingId });

      await repository.create(dto, userId.toString());

      const payload = bookingModel.mock.calls[0][0] as {
        reservationExpiresAt: Date;
      };
      expect(payload.reservationExpiresAt.toISOString()).toBe(
        '2026-08-20T12:15:00.000Z',
      );
    });

    it('should round the amounts to two decimals', async () => {
      slotModel.findById.mockReturnValue(
        mockQuery({ _id: slotId, maxParticipants: 10, priceEur: 99.99 }),
      );
      bookingModel.countDocuments.mockReturnValue(mockQuery(0));
      saveMock.mockResolvedValue({ _id: bookingId });

      await repository.create(dto, userId.toString());

      const payload = bookingModel.mock.calls[0][0] as {
        totalEur: number;
        vatEur: number;
      };
      expect(payload.vatEur).toBe(40);
      expect(payload.totalEur).toBe(239.98);
    });

    it('should map the saved document to an entity', async () => {
      slotModel.findById.mockReturnValue(
        mockQuery({ _id: slotId, maxParticipants: 10, priceEur: 100 }),
      );
      bookingModel.countDocuments.mockReturnValue(mockQuery(0));
      saveMock.mockResolvedValue({ _id: bookingId });

      const result = await repository.create(dto, userId.toString());

      expect(result).toEqual({ entityFor: bookingId.toString() });
    });

    it('should return null when the save returns nothing', async () => {
      slotModel.findById.mockReturnValue(
        mockQuery({ _id: slotId, maxParticipants: 10, priceEur: 100 }),
      );
      bookingModel.countDocuments.mockReturnValue(mockQuery(0));
      saveMock.mockResolvedValue(null);

      expect(await repository.create(dto, userId.toString())).toBeNull();
    });
  });

  describe('findById()', () => {
    it('should map the found document', async () => {
      bookingModel.findById.mockReturnValue(mockQuery({ _id: 'b1' }));

      const result = await repository.findById('b1');

      expect(result).toEqual({ entityFor: 'b1' });
    });

    it('should return null when the booking does not exist', async () => {
      bookingModel.findById.mockReturnValue(mockQuery(null));

      expect(await repository.findById('missing')).toBeNull();
    });
  });

  describe('findBySlotId()', () => {
    it('should map every booking of the slot', async () => {
      bookingModel.find.mockReturnValue(
        mockQuery([{ _id: 'b1' }, { _id: 'b2' }]),
      );

      const result = await repository.findBySlotId('slot-1');

      expect(bookingModel.find).toHaveBeenCalledWith({ slotId: 'slot-1' });
      expect(result).toEqual([{ entityFor: 'b1' }, { entityFor: 'b2' }]);
    });

    it('should return an empty array when the slot has no booking', async () => {
      bookingModel.find.mockReturnValue(mockQuery([]));

      expect(await repository.findBySlotId('slot-1')).toEqual([]);
    });

    it('should return null when the query resolves to null', async () => {
      bookingModel.find.mockReturnValue(mockQuery(null));

      expect(await repository.findBySlotId('slot-1')).toBeNull();
    });
  });

  describe('findDetailById()', () => {
    const buildBooking = (overrides: Record<string, unknown> = {}) => ({
      _id: bookingId,
      userId,
      slotId,
      status: 'pending_payment',
      reservationExpiresAt: new Date('2026-08-20T12:15:00.000Z'),
      totalEur: 240,
      vatEur: 40,
      participants: [
        { firstName: 'Remi', lastName: 'Durand', extra: 'ignore' },
      ],
      ...overrides,
    });

    const stubChain = (options: {
      booking?: unknown;
      slot?: unknown;
      activity?: unknown;
      waiverCount?: number;
    }) => {
      bookingModel.findById.mockReturnValue(
        mockQuery('booking' in options ? options.booking : buildBooking()),
      );
      slotModel.findById.mockReturnValue(
        mockQuery(
          'slot' in options
            ? options.slot
            : {
                _id: slotId,
                activityId,
                startAt: new Date('2026-09-01T08:00:00.000Z'),
              },
        ),
      );
      activityModel.findById.mockReturnValue(
        mockQuery(
          'activity' in options
            ? options.activity
            : { _id: activityId, title: 'Escalade Fontainebleau' },
        ),
      );
      waiverModel.countDocuments.mockReturnValue(
        mockQuery(options.waiverCount ?? 0),
      );
    };

    it('should throw NotFoundException for an invalid ObjectId', async () => {
      await expect(
        repository.findDetailById('not-an-object-id', userId.toString()),
      ).rejects.toThrow(NotFoundException);
      expect(bookingModel.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the booking does not exist', async () => {
      stubChain({ booking: null });

      await expect(
        repository.findDetailById(bookingId.toString(), userId.toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when the booking belongs to another user', async () => {
      stubChain({});

      await expect(
        repository.findDetailById(
          bookingId.toString(),
          new Types.ObjectId().toString(),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when the slot is missing', async () => {
      stubChain({ slot: null });

      await expect(
        repository.findDetailById(bookingId.toString(), userId.toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when the activity is missing', async () => {
      stubChain({ activity: null });

      await expect(
        repository.findDetailById(bookingId.toString(), userId.toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should build the detail DTO of a pending booking', async () => {
      stubChain({});

      const result = await repository.findDetailById(
        bookingId.toString(),
        userId.toString(),
      );

      expect(result).toEqual({
        bookingId: bookingId.toString(),
        status: 'pending_payment',
        reservationExpiresAt: '2026-08-20T12:15:00.000Z',
        totalEur: 240,
        vatEur: 40,
        participants: [{ firstName: 'Remi', lastName: 'Durand' }],
        activityTitle: 'Escalade Fontainebleau',
        slotStartAt: '2026-09-01T08:00:00.000Z',
        waiverSigned: false,
      });
    });

    it('should never expose a Stripe client secret', async () => {
      stubChain({
        booking: buildBooking({ paymentIntentClientSecret: 'pi_secret' }),
      });

      const result = await repository.findDetailById(
        bookingId.toString(),
        userId.toString(),
      );

      expect(result).not.toHaveProperty('paymentIntentClientSecret');
    });

    it('should clear the expiry once the booking is confirmed', async () => {
      stubChain({ booking: buildBooking({ status: 'confirmed' }) });

      const result = await repository.findDetailById(
        bookingId.toString(),
        userId.toString(),
      );

      expect(result.reservationExpiresAt).toBeNull();
    });

    it('should return a null expiry when the pending booking has none', async () => {
      stubChain({
        booking: buildBooking({ reservationExpiresAt: undefined }),
      });

      const result = await repository.findDetailById(
        bookingId.toString(),
        userId.toString(),
      );

      expect(result.reservationExpiresAt).toBeNull();
    });

    it('should flag the waiver as signed when at least one exists', async () => {
      stubChain({ waiverCount: 2 });

      const result = await repository.findDetailById(
        bookingId.toString(),
        userId.toString(),
      );

      expect(result.waiverSigned).toBe(true);
      expect(waiverModel.countDocuments).toHaveBeenCalledWith({
        bookingId,
      });
    });
  });

  describe('confirmPayment()', () => {
    const buildBooking = (overrides: Record<string, unknown> = {}) => ({
      _id: bookingId,
      userId,
      slotId,
      status: 'pending_payment',
      totalEur: 240,
      ...overrides,
    });

    it('should throw NotFoundException when the booking does not exist', async () => {
      bookingModel.findById.mockReturnValue(mockQuery(null));

      await expect(
        repository.confirmPayment(bookingId.toString(), {
          paymentIntentId: 'pi_1',
        } as ConfirmPaymentDto),
      ).rejects.toThrow(NotFoundException);
    });

    it.each(['confirmed', 'partial_paid'])(
      'should throw ConflictException when the booking is already %s',
      async (status) => {
        bookingModel.findById.mockReturnValue(
          mockQuery(buildBooking({ status })),
        );

        await expect(
          repository.confirmPayment(bookingId.toString(), {
            paymentIntentId: 'pi_1',
          } as ConfirmPaymentDto),
        ).rejects.toThrow(ConflictException);
      },
    );

    it('should throw BadRequestException for any other unexpected status', async () => {
      bookingModel.findById.mockReturnValue(
        mockQuery(buildBooking({ status: 'cancelled' })),
      );

      await expect(
        repository.confirmPayment(bookingId.toString(), {
          paymentIntentId: 'pi_1',
        } as ConfirmPaymentDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should confirm the booking for a full payment', async () => {
      bookingModel.findById.mockReturnValue(mockQuery(buildBooking()));
      bookingModel.findByIdAndUpdate.mockReturnValue(mockQuery({}));

      const result = await repository.confirmPayment(bookingId.toString(), {
        paymentIntentId: 'pi_1',
      } as ConfirmPaymentDto);

      expect(result).toEqual({
        bookingId: bookingId.toString(),
        status: 'confirmed',
        paidAmountEur: 240,
        remainingAmountEur: 0,
      });
      expect(bookingModel.findByIdAndUpdate).toHaveBeenCalledWith(
        bookingId.toString(),
        {
          status: 'confirmed',
          stripePaymentIntentId: 'pi_1',
          paidAmountEur: 240,
          remainingAmountEur: 0,
        },
        { new: true },
      );
    });

    it('should charge a 30 % deposit when no payment intent is provided', async () => {
      bookingModel.findById
        .mockReturnValueOnce(mockQuery(buildBooking()))
        .mockReturnValueOnce(mockQuery({ slotId }));
      bookingModel.findByIdAndUpdate.mockReturnValue(mockQuery({}));

      const result = await repository.confirmPayment(
        bookingId.toString(),
        {} as ConfirmPaymentDto,
      );

      expect(result.status).toBe('partial_paid');
      expect(result.paidAmountEur).toBe(72);
      expect(result.remainingAmountEur).toBe(168);
    });

    it('should set a J-7 final payment due date for a partial payment', async () => {
      bookingModel.findById
        .mockReturnValueOnce(mockQuery(buildBooking()))
        .mockReturnValueOnce(mockQuery({ slotId }));
      bookingModel.findByIdAndUpdate.mockReturnValue(mockQuery({}));

      const result = await repository.confirmPayment(
        bookingId.toString(),
        {} as ConfirmPaymentDto,
      );

      expect(result.finalPaymentDueAt).toBe('2026-08-27T12:00:00.000Z');
      const payload = bookingModel.findByIdAndUpdate.mock.calls[0][1] as {
        finalPaymentDueAt?: Date;
      };
      expect(payload.finalPaymentDueAt).toEqual(
        new Date('2026-08-27T12:00:00.000Z'),
      );
    });

    it('should not expose a final payment due date for a full payment', async () => {
      bookingModel.findById.mockReturnValue(mockQuery(buildBooking()));
      bookingModel.findByIdAndUpdate.mockReturnValue(mockQuery({}));

      const result = await repository.confirmPayment(bookingId.toString(), {
        paymentIntentId: 'pi_1',
      } as ConfirmPaymentDto);

      expect(result).not.toHaveProperty('finalPaymentDueAt');
    });

    it('should round the deposit to two decimals', async () => {
      bookingModel.findById
        .mockReturnValueOnce(mockQuery(buildBooking({ totalEur: 99.99 })))
        .mockReturnValueOnce(mockQuery({ slotId }));
      bookingModel.findByIdAndUpdate.mockReturnValue(mockQuery({}));

      const result = await repository.confirmPayment(
        bookingId.toString(),
        {} as ConfirmPaymentDto,
      );

      expect(result.paidAmountEur).toBe(30);
      expect(result.remainingAmountEur).toBe(69.99);
    });
  });

  describe('cancelBooking()', () => {
    const dto = { reason: 'personal' } as CancelBookingDto;

    const buildBooking = (overrides: Record<string, unknown> = {}) => ({
      _id: bookingId,
      userId,
      slotId,
      status: 'confirmed',
      totalEur: 240,
      paidAmountEur: 240,
      ...overrides,
    });

    // startAt exprime le nombre de jours restant avant le creneau
    const stubCancel = (options: {
      booking?: unknown;
      daysUntilSlot?: number | null;
    }) => {
      bookingModel.findById.mockReturnValue(
        mockQuery('booking' in options ? options.booking : buildBooking()),
      );
      const days = options.daysUntilSlot;
      slotModel.findById.mockReturnValue(
        mockQuery(
          days === null || days === undefined
            ? days === null
              ? null
              : {
                  _id: slotId,
                  startAt: new Date(NOW.getTime() + 30 * 86400000),
                }
            : {
                _id: slotId,
                startAt: new Date(NOW.getTime() + days * 86400000),
              },
        ),
      );
      bookingModel.findByIdAndUpdate.mockReturnValue(mockQuery({}));
    };

    it('should throw NotFoundException when the booking does not exist', async () => {
      bookingModel.findById.mockReturnValue(mockQuery(null));

      await expect(
        repository.cancelBooking(bookingId.toString(), dto, userId.toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when the booking belongs to another user', async () => {
      stubCancel({});

      await expect(
        repository.cancelBooking(
          bookingId.toString(),
          dto,
          new Types.ObjectId().toString(),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when the booking is already cancelled', async () => {
      stubCancel({ booking: buildBooking({ status: 'cancelled' }) });

      await expect(
        repository.cancelBooking(bookingId.toString(), dto, userId.toString()),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when the activity is already completed', async () => {
      stubCancel({ booking: buildBooking({ status: 'completed' }) });

      await expect(
        repository.cancelBooking(bookingId.toString(), dto, userId.toString()),
      ).rejects.toThrow(ConflictException);
    });

    it('should apply a full refund more than 15 days before the slot', async () => {
      stubCancel({ daysUntilSlot: 20 });

      const result = await repository.cancelBooking(
        bookingId.toString(),
        dto,
        userId.toString(),
      );

      expect(result.refundPolicyApplied).toBe('full');
      expect(result.refundedAmountEur).toBe(240);
      expect(result.refundEta).toContain('intégral');
    });

    it('should apply a full refund when the slot is unknown', async () => {
      stubCancel({ daysUntilSlot: null });

      const result = await repository.cancelBooking(
        bookingId.toString(),
        dto,
        userId.toString(),
      );

      expect(result.refundPolicyApplied).toBe('full');
      expect(result.refundedAmountEur).toBe(240);
    });

    it('should apply a 50 % refund between 7 and 15 days before the slot', async () => {
      stubCancel({ daysUntilSlot: 10 });

      const result = await repository.cancelBooking(
        bookingId.toString(),
        dto,
        userId.toString(),
      );

      expect(result.refundPolicyApplied).toBe('partial');
      expect(result.refundedAmountEur).toBe(120);
      expect(result.refundEta).toContain('partiel');
    });

    it('should refuse any refund less than 7 days before the slot', async () => {
      stubCancel({ daysUntilSlot: 3 });

      const result = await repository.cancelBooking(
        bookingId.toString(),
        dto,
        userId.toString(),
      );

      expect(result.refundPolicyApplied).toBe('none');
      expect(result.refundedAmountEur).toBe(0);
      expect(result.refundEta).toBe(
        "Aucun remboursement : l'annulation intervient moins de 7 jours avant l'activité",
      );
    });

    it('should state that nothing was charged when no payment was made', async () => {
      stubCancel({
        booking: buildBooking({ paidAmountEur: undefined }),
        daysUntilSlot: 3,
      });

      const result = await repository.cancelBooking(
        bookingId.toString(),
        dto,
        userId.toString(),
      );

      expect(result.refundedAmountEur).toBe(0);
      expect(result.refundEta).toContain('Aucun remboursement à effectuer');
    });

    it('should create a Stripe refund in cents when a payment intent exists', async () => {
      stubCancel({
        booking: buildBooking({ stripePaymentIntentId: 'pi_1' }),
        daysUntilSlot: 20,
      });
      mockStripe.create.mockResolvedValue({ id: 're_1' });

      await repository.cancelBooking(
        bookingId.toString(),
        dto,
        userId.toString(),
      );

      expect(mockStripe.create).toHaveBeenCalledWith({
        payment_intent: 'pi_1',
        amount: 24000,
      });
      const payload = bookingModel.findByIdAndUpdate.mock.calls[0][1] as {
        stripeRefundId?: string;
      };
      expect(payload.stripeRefundId).toBe('re_1');
    });

    it('should not call Stripe when no payment intent is attached', async () => {
      stubCancel({ daysUntilSlot: 20 });

      await repository.cancelBooking(
        bookingId.toString(),
        dto,
        userId.toString(),
      );

      expect(mockStripe.create).not.toHaveBeenCalled();
      const payload = bookingModel.findByIdAndUpdate.mock.calls[0][1] as {
        stripeRefundId?: string;
      };
      expect(payload.stripeRefundId).toBeUndefined();
    });

    it('should not call Stripe when nothing has to be refunded', async () => {
      stubCancel({
        booking: buildBooking({ stripePaymentIntentId: 'pi_1' }),
        daysUntilSlot: 3,
      });

      await repository.cancelBooking(
        bookingId.toString(),
        dto,
        userId.toString(),
      );

      expect(mockStripe.create).not.toHaveBeenCalled();
    });

    it('should still report the refund when Stripe is not configured', async () => {
      repository = buildRepository(undefined);
      stubCancel({
        booking: buildBooking({ stripePaymentIntentId: 'pi_1' }),
        daysUntilSlot: 20,
      });

      const result = await repository.cancelBooking(
        bookingId.toString(),
        dto,
        userId.toString(),
      );

      expect(mockStripe.create).not.toHaveBeenCalled();
      expect(result.refundedAmountEur).toBe(240);
    });

    it('should persist the cancellation reason and comment', async () => {
      stubCancel({ daysUntilSlot: 20 });

      await repository.cancelBooking(
        bookingId.toString(),
        { reason: 'weather', comment: 'Tempete annoncee' } as CancelBookingDto,
        userId.toString(),
      );

      expect(bookingModel.findByIdAndUpdate).toHaveBeenCalledWith(
        bookingId.toString(),
        {
          status: 'cancelled',
          cancellationReason: 'weather',
          cancellationComment: 'Tempete annoncee',
          cancelledAt: NOW,
          refundedAmountEur: 240,
          refundPolicy: 'full',
        },
        { new: true },
      );
    });

    it('should omit the comment when none is provided', async () => {
      stubCancel({ daysUntilSlot: 20 });

      await repository.cancelBooking(
        bookingId.toString(),
        dto,
        userId.toString(),
      );

      const payload = bookingModel.findByIdAndUpdate.mock.calls[0][1] as Record<
        string,
        unknown
      >;
      expect(payload).not.toHaveProperty('cancellationComment');
    });

    it('should return the cancelled status', async () => {
      stubCancel({ daysUntilSlot: 20 });

      const result = await repository.cancelBooking(
        bookingId.toString(),
        dto,
        userId.toString(),
      );

      expect(result.bookingId).toBe(bookingId.toString());
      expect(result.status).toBe('cancelled');
    });
  });
});
