import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { BookingMapper } from './booking.mapper';
import { BookingDocument } from '@features/booking/domains/schemas/booking.schema';

describe('BookingMapper', () => {
  let mapper: BookingMapper;

  const bookingId = new Types.ObjectId();
  const slotId = new Types.ObjectId();
  const userId = new Types.ObjectId();

  // Fabrique un faux document Mongoose : seules les proprietes lues par le
  // mapper sont necessaires, d'ou le double cast.
  const buildDocument = (
    overrides: Record<string, unknown> = {},
  ): BookingDocument =>
    ({
      _id: bookingId,
      slotId,
      userId,
      participants: [{ firstName: 'Remi', lastName: 'Durand' }],
      acceptCenterTerms: true,
      status: 'pending_payment',
      reservationExpiresAt: new Date('2026-08-20T12:15:00.000Z'),
      totalEur: 180,
      vatEur: 30,
      paymentIntentClientSecret: 'pi_secret',
      ...overrides,
    }) as unknown as BookingDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingMapper],
    }).compile();
    mapper = module.get<BookingMapper>(BookingMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('toEntity()', () => {
    it('should map the mandatory fields of a pending booking', () => {
      const entity = mapper.toEntity(buildDocument());

      expect(entity.getId()).toBe(bookingId.toString());
      expect(entity.getSlotId()).toBe(slotId);
      expect(entity.getUserId()).toBe(userId);
      expect(entity.getParticipants()).toEqual([
        { firstName: 'Remi', lastName: 'Durand' },
      ]);
      expect(entity.getAcceptCenterTerms()).toBe(true);
      expect(entity.getStatus()).toBe('pending_payment');
      expect(entity.getReservationExpiresAt()).toEqual(
        new Date('2026-08-20T12:15:00.000Z'),
      );
      expect(entity.getTotalEur()).toBe(180);
      expect(entity.getVatEur()).toBe(30);
      expect(entity.getPaymentIntentClientSecret()).toBe('pi_secret');
    });

    it('should leave every optional field undefined when absent', () => {
      const entity = mapper.toEntity(buildDocument());

      expect(entity.getStripePaymentIntentId()).toBeUndefined();
      expect(entity.getPaidAmountEur()).toBeUndefined();
      expect(entity.getRemainingAmountEur()).toBeUndefined();
      expect(entity.getFinalPaymentDueAt()).toBeUndefined();
      expect(entity.getCancellationReason()).toBeUndefined();
      expect(entity.getCancellationComment()).toBeUndefined();
      expect(entity.getCancelledAt()).toBeUndefined();
      expect(entity.getRefundedAmountEur()).toBeUndefined();
      expect(entity.getRefundPolicy()).toBeUndefined();
      expect(entity.getStripeRefundId()).toBeUndefined();
    });

    it('should map the payment fields of a partially paid booking', () => {
      const entity = mapper.toEntity(
        buildDocument({
          status: 'partial_paid',
          stripePaymentIntentId: 'pi_123',
          paidAmountEur: 54,
          remainingAmountEur: 126,
          finalPaymentDueAt: new Date('2026-08-27T00:00:00.000Z'),
        }),
      );

      expect(entity.getStatus()).toBe('partial_paid');
      expect(entity.getStripePaymentIntentId()).toBe('pi_123');
      expect(entity.getPaidAmountEur()).toBe(54);
      expect(entity.getRemainingAmountEur()).toBe(126);
      expect(entity.getFinalPaymentDueAt()).toEqual(
        new Date('2026-08-27T00:00:00.000Z'),
      );
    });

    it('should map the cancellation fields of a cancelled booking', () => {
      const entity = mapper.toEntity(
        buildDocument({
          status: 'cancelled',
          cancellationReason: 'weather',
          cancellationComment: 'Tempete annoncee',
          cancelledAt: new Date('2026-08-19T09:00:00.000Z'),
          refundedAmountEur: 90,
          refundPolicy: 'partial',
          stripeRefundId: 're_123',
        }),
      );

      expect(entity.getStatus()).toBe('cancelled');
      expect(entity.getCancellationReason()).toBe('weather');
      expect(entity.getCancellationComment()).toBe('Tempete annoncee');
      expect(entity.getCancelledAt()).toEqual(
        new Date('2026-08-19T09:00:00.000Z'),
      );
      expect(entity.getRefundedAmountEur()).toBe(90);
      expect(entity.getRefundPolicy()).toBe('partial');
      expect(entity.getStripeRefundId()).toBe('re_123');
    });

    it('should map zero amounts, which are falsy but defined', () => {
      const entity = mapper.toEntity(
        buildDocument({
          paidAmountEur: 0,
          remainingAmountEur: 0,
          refundedAmountEur: 0,
        }),
      );

      expect(entity.getPaidAmountEur()).toBe(0);
      expect(entity.getRemainingAmountEur()).toBe(0);
      expect(entity.getRefundedAmountEur()).toBe(0);
    });

    it('should ignore an empty stripePaymentIntentId', () => {
      const entity = mapper.toEntity(
        buildDocument({ stripePaymentIntentId: '' }),
      );

      expect(entity.getStripePaymentIntentId()).toBeUndefined();
    });
  });
});
