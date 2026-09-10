import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: AuditLog;

  @Prop({ required: true, type: String })
  targetUserId: string;

  @Prop({ required: true, type: String })
  adminId: string;

  @Prop({
    required: true,
    type: String,
    enum: ['active', 'suspended', 'banned'],
  })
  previousStatus: string;

  @Prop({
    required: true,
    type: String,
    enum: ['active', 'suspended', 'banned'],
  })
  newStatus: string;

  @Prop({ required: true, type: String })
  reason: string;

  @Prop({ required: false, type: Number })
  durationDays?: number;

  @Prop({ required: false, type: Date })
  effectiveUntil?: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
