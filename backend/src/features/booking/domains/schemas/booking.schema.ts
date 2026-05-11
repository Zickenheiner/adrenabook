import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ _id: false })
export class Participant {
  @Prop({ required: true, type: String })
  firstName: string;

  @Prop({ required: true, type: String })
  lastName: string;

  @Prop({ required: true, type: String })
  birthDate: string;

  @Prop({ required: false, type: Number })
  weightKg?: number;
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: Booking;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
  })
  slotId: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true, type: [Participant], default: [] })
  participants: Participant[];

  @Prop({ required: true, type: Boolean })
  acceptCenterTerms: boolean;

  @Prop({ required: true, type: String, default: 'pending_payment' })
  status: string;

  @Prop({ required: true, type: Date })
  reservationExpiresAt: Date;

  @Prop({ required: true, type: Number })
  totalEur: number;

  @Prop({ required: true, type: Number })
  vatEur: number;

  @Prop({ required: true, type: String })
  paymentIntentClientSecret: string;

  @Prop({ required: false, type: String })
  stripePaymentIntentId?: string;

  @Prop({ required: false, type: Number })
  paidAmountEur?: number;

  @Prop({ required: false, type: Number })
  remainingAmountEur?: number;

  @Prop({ required: false, type: Date })
  finalPaymentDueAt?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
