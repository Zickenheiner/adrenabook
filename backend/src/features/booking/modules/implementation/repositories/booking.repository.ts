import {
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
import { CreateBookingDto } from '@features/booking/domains/dtos/booking.dto';
import { BookingEntity } from '@features/booking/domains/entities/booking.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

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
}
