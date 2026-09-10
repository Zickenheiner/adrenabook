import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: Invoice;

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

  @Prop({ required: true, type: String, unique: true })
  invoiceNumber: string;

  @Prop({ required: true, type: Date })
  issuedAt: Date;

  @Prop({ required: true, type: Number })
  totalEur: number;

  @Prop({ required: true, type: Number })
  vatEur: number;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
