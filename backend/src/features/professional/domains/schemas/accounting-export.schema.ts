import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AccountingExportDocument = AccountingExport & Document;

@Schema({ timestamps: true })
export class AccountingExport {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: AccountingExport;

  @Prop({
    required: true,
    type: String,
    enum: ['sage50', 'sage100', 'csv_generic'],
  })
  format: string;

  @Prop({ required: true, type: Date })
  from: Date;

  @Prop({ required: true, type: Date })
  to: Date;

  @Prop({ required: true, type: Boolean })
  includeRefunds: boolean;

  @Prop({
    required: true,
    type: String,
    enum: ['download', 'email'],
  })
  deliveryMode: string;

  @Prop({
    required: true,
    type: String,
    enum: ['ready', 'queued'],
    default: 'queued',
  })
  status: string;

  @Prop({ required: false, type: String })
  downloadUrl?: string;

  @Prop({ required: false, type: String })
  emailDeliveredTo?: string;

  @Prop({ required: true, type: Number, default: 0 })
  recordsCount: number;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  professionalId: mongoose.Types.ObjectId;
}

export const AccountingExportSchema =
  SchemaFactory.createForClass(AccountingExport);
