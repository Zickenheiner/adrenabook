import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IBookingRepository } from '../../../interfaces/repositories/booking.irepository';
import { BookingMapper } from '../mappers/booking.mapper';
import {
  Booking,
  BookingDocument,
} from '@features/booking/domains/schemas/booking.schema';
import { Slot, SlotDocument } from '@features/slot/domains/schemas/slot.schema';
import { Model } from 'mongoose';
import {
  ConfirmPaymentDto,
  ConfirmPaymentResponseDto,
  CreateBookingDto,
} from '@features/booking/domains/dtos/booking.dto';
import { BookingEntity } from '@features/booking/domains/entities/booking.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

const DEPOSIT_RATE = 0.3;

const VAT_RATE = 0.2;

@Injectable()
export class BookingRepository implements IBookingRepository {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Slot.name)
    private readonly slotModel: Model<SlotDocument>,
    private readonly bookingMapper: BookingMapper,
  ) {}

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
}
