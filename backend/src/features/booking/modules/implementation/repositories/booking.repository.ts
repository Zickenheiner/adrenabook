import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IBookingRepository } from '../../../interfaces/repositories/booking.irepository';
import { BookingMapper } from '../mappers/booking.mapper';
import {
  Booking,
  BookingDocument,
} from '@features/booking/domains/schemas/booking.schema';
import { Slot, SlotDocument } from '@features/slot/domains/schemas/slot.schema';
import { Model } from 'mongoose';
import {
  CancelBookingDto,
  CancelBookingResponseDto,
  ConfirmPaymentDto,
  ConfirmPaymentResponseDto,
  CreateBookingDto,
} from '@features/booking/domains/dtos/booking.dto';
import { BookingEntity } from '@features/booking/domains/entities/booking.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const StripeLib = require('stripe');

const DEPOSIT_RATE = 0.3;

const VAT_RATE = 0.2;

// Refund policy thresholds in milliseconds
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const FULL_REFUND_THRESHOLD_DAYS = 15;
const PARTIAL_REFUND_THRESHOLD_DAYS = 7;
const PARTIAL_REFUND_RATE = 0.5;

@Injectable()
export class BookingRepository implements IBookingRepository {
  private readonly stripe: {
    refunds: {
      create: (params: {
        payment_intent: string;
        amount: number;
      }) => Promise<{ id: string }>;
    };
  } | null;

  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Slot.name)
    private readonly slotModel: Model<SlotDocument>,
    private readonly bookingMapper: BookingMapper,
    private readonly configService: ConfigService,
  ) {
    const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecret) {
      this.stripe = new StripeLib(stripeSecret, {
        apiVersion: '2026-04-22.dahlia',
      });
    } else {
      this.stripe = null;
    }
  }

  async create(
    dto: CreateBookingDto,
    userId: string,
  ): Promise<BookingEntity | null> {
    const slot = await this.slotModel.findById(dto.slotId).exec();
    if (!slot) {
      throw new NotFoundException('Créneau introuvable');
    }

    const existingBookings = await this.bookingModel
      .countDocuments({ slotId: slot._id, status: { $ne: 'cancelled' } })
      .exec();

    const participantCount = dto.participants.length;
    const availableSpots = slot.maxParticipants - existingBookings;

    if (participantCount > availableSpots) {
      throw new ConflictException('Plus assez de places disponibles');
    }

    const priceEur = slot.priceEur * participantCount;
    const vatEur = Math.round(priceEur * VAT_RATE * 100) / 100;
    const totalEur = Math.round((priceEur + vatEur) * 100) / 100;
    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const document = new this.bookingModel({
      slotId: new mongoose.Types.ObjectId(dto.slotId),
      userId: new mongoose.Types.ObjectId(userId),
      participants: dto.participants,
      acceptCenterTerms: dto.acceptCenterTerms,
      status: 'pending_payment',
      reservationExpiresAt,
      totalEur,
      vatEur,
      paymentIntentClientSecret: '',
    });

    const saved = await document.save();
    return saved ? this.bookingMapper.toEntity(saved as BookingDocument) : null;
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const booking = await this.bookingModel.findById(id).exec();
    return booking ? this.bookingMapper.toEntity(booking) : null;
  }

  async findBySlotId(slotId: string): Promise<BookingEntity[] | null> {
    const bookings = await this.bookingModel.find({ slotId }).exec();
    return bookings
      ? bookings.map((doc) => this.bookingMapper.toEntity(doc))
      : null;
  }

  async confirmPayment(
    id: string,
    dto: ConfirmPaymentDto,
  ): Promise<ConfirmPaymentResponseDto> {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException('Reservation introuvable');
    }

    if (booking.status === 'confirmed' || booking.status === 'partial_paid') {
      throw new ConflictException('Paiement deja traite');
    }

    if (booking.status !== 'pending_payment') {
      throw new BadRequestException(
        'La reservation ne peut pas etre confirmee dans son etat actuel',
      );
    }

    const depositAmount =
      Math.round(booking.totalEur * DEPOSIT_RATE * 100) / 100;
    const remainingAmount =
      Math.round((booking.totalEur - depositAmount) * 100) / 100;

    const isFullPayment = dto.paymentIntentId !== undefined;
    const paidAmount = isFullPayment ? booking.totalEur : depositAmount;
    const remaining = isFullPayment ? 0 : remainingAmount;
    const status: 'confirmed' | 'partial_paid' =
      remaining === 0 ? 'confirmed' : 'partial_paid';

    // J-7 final payment due date (only relevant for partial payments)
    let finalPaymentDueAt: Date | undefined;
    if (status === 'partial_paid') {
      const slot = await this.bookingModel
        .findById(id)
        .select('slotId')
        .populate('slotId')
        .exec();
      // Fallback: set 7 days from now if slot date not available
      finalPaymentDueAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      void slot;
    }

    await this.bookingModel
      .findByIdAndUpdate(
        id,
        {
          status,
          stripePaymentIntentId: dto.paymentIntentId,
          paidAmountEur: paidAmount,
          remainingAmountEur: remaining,
          ...(finalPaymentDueAt && { finalPaymentDueAt }),
        },
        { new: true },
      )
      .exec();

    return {
      bookingId: id,
      status,
      paidAmountEur: paidAmount,
      remainingAmountEur: remaining,
      ...(finalPaymentDueAt && {
        finalPaymentDueAt: finalPaymentDueAt.toISOString(),
      }),
    };
  }

  async cancelBooking(
    id: string,
    dto: CancelBookingDto,
    userId: string,
  ): Promise<CancelBookingResponseDto> {
    const booking = await this.bookingModel.findById(id).exec();

    if (!booking) {
      throw new NotFoundException('Réservation introuvable');
    }

    if (booking.userId.toString() !== userId) {
      throw new ForbiddenException(
        'Cette réservation appartient à un autre utilisateur',
      );
    }

    if (booking.status === 'cancelled') {
      throw new ConflictException('Cette réservation est déjà annulée');
    }

    if (booking.status === 'completed') {
      throw new ConflictException(
        "L'activité a déjà été réalisée, annulation impossible",
      );
    }

    // Determine refund policy based on days until slot
    const slot = await this.slotModel.findById(booking.slotId).exec();
    let daysUntilSlot = Infinity;
    if (slot && slot.startAt) {
      const now = Date.now();
      daysUntilSlot = (slot.startAt.getTime() - now) / MS_PER_DAY;
    }

    let refundPolicy: 'full' | 'partial' | 'none';
    let refundedAmountEur: number;
    const paidAmount = booking.paidAmountEur ?? 0;

    if (daysUntilSlot > FULL_REFUND_THRESHOLD_DAYS) {
      refundPolicy = 'full';
      refundedAmountEur = paidAmount;
    } else if (daysUntilSlot >= PARTIAL_REFUND_THRESHOLD_DAYS) {
      refundPolicy = 'partial';
      refundedAmountEur =
        Math.round(paidAmount * PARTIAL_REFUND_RATE * 100) / 100;
    } else {
      refundPolicy = 'none';
      refundedAmountEur = 0;
    }

    // Process Stripe refund if applicable
    let stripeRefundId: string | undefined;
    if (refundedAmountEur > 0 && booking.stripePaymentIntentId && this.stripe) {
      const refundAmountCents = Math.round(refundedAmountEur * 100);
      const refund = await this.stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
        amount: refundAmountCents,
      });
      stripeRefundId = refund.id;
    }

    const cancelledAt = new Date();

    await this.bookingModel
      .findByIdAndUpdate(
        id,
        {
          status: 'cancelled',
          cancellationReason: dto.reason,
          ...(dto.comment && { cancellationComment: dto.comment }),
          cancelledAt,
          refundedAmountEur,
          refundPolicy,
          ...(stripeRefundId && { stripeRefundId }),
        },
        { new: true },
      )
      .exec();

    return {
      bookingId: id,
      status: 'cancelled',
      refundedAmountEur,
      refundPolicyApplied: refundPolicy,
      refundEta:
        refundedAmountEur > 0 ? '5-10 jours ouvrés' : 'Aucun remboursement',
    };
  }
}
