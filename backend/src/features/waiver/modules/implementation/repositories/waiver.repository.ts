import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHash } from 'crypto';
import mongoose from 'mongoose';
import { IWaiverRepository } from '../../../interfaces/repositories/waiver.irepository';
import {
  Waiver,
  WaiverDocument,
} from '@features/waiver/domains/schemas/waiver.schema';
import { WaiverEntity } from '@features/waiver/domains/entities/waiver.entity';
import { SignWaiverDto } from '@features/waiver/domains/dtos/waiver.dto';
import { WaiverMapper } from '../mappers/waiver.mapper';
import {
  Booking,
  BookingDocument,
} from '@features/booking/domains/schemas/booking.schema';

@Injectable()
export class WaiverRepository implements IWaiverRepository {
  constructor(
    @InjectModel(Waiver.name)
    private readonly waiverModel: Model<WaiverDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    private readonly waiverMapper: WaiverMapper,
  ) {}

  async findByBookingId(bookingId: string): Promise<WaiverEntity | null> {
    const waiver = await this.waiverModel.findOne({ bookingId }).exec();
    return waiver ? this.waiverMapper.toEntity(waiver) : null;
  }

  async sign(
    bookingId: string,
    userId: string,
    dto: SignWaiverDto,
  ): Promise<WaiverEntity> {
    const booking = await this.bookingModel.findById(bookingId).exec();
    if (!booking) {
      throw new NotFoundException('Réservation introuvable');
    }

    const existing = await this.waiverModel.findOne({ bookingId }).exec();
    if (existing) {
      throw new ConflictException(
        'Décharge déjà signée pour cette réservation',
      );
    }

    if (!dto.acknowledgedRisks) {
      throw new BadRequestException(
        'La prise de connaissance des risques est obligatoire',
      );
    }

    if (dto.signatureMethod === 'otp_sms') {
      const otpRegex = /^\d{6}$/;
      if (!otpRegex.test(dto.signaturePayload)) {
        throw new BadRequestException(
          'Code OTP invalide : doit contenir exactement 6 chiffres',
        );
      }
    }

    const signedAt = new Date();
    const hashInput = `${bookingId}:${userId}:${dto.signatureMethod}:${dto.signaturePayload}:${signedAt.toISOString()}`;
    const documentHash = createHash('sha256').update(hashInput).digest('hex');

    // Pas de downloadUrl : la génération du PDF de la décharge n'est pas encore
    // implémentée, on ne stocke donc aucune URL plutôt qu'un lien mort.
    const document = new this.waiverModel({
      bookingId: new mongoose.Types.ObjectId(bookingId),
      userId: new mongoose.Types.ObjectId(userId),
      signatureMethod: dto.signatureMethod,
      signaturePayload: dto.signaturePayload,
      acknowledgedRisks: dto.acknowledgedRisks,
      documentHash,
      signedAt,
    });

    const saved = await document.save();
    return this.waiverMapper.toEntity(saved as WaiverDocument);
  }
}
