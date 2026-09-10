import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type WaiverDocument = Waiver & Document;

@Schema({ timestamps: true })
export class Waiver {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: Waiver;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  })
  bookingId: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true, type: String, enum: ['canvas', 'otp_sms'] })
  signatureMethod: string;

  @Prop({ required: true, type: String })
  signaturePayload: string;

  @Prop({ required: true, type: Boolean })
  acknowledgedRisks: boolean;

  @Prop({ required: true, type: String })
  documentHash: string;

  @Prop({ required: true, type: Date })
  signedAt: Date;

  // Optionnel : reste vide tant que la generation du PDF n'est pas implementee
  @Prop({ required: false, type: String })
  downloadUrl?: string;
}

export const WaiverSchema = SchemaFactory.createForClass(Waiver);
