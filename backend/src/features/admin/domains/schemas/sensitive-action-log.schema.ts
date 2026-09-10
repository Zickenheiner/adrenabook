import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type SensitiveActionLogDocument = SensitiveActionLog & Document;

export type ActionType =
  | 'auth.login'
  | 'auth.login_failed'
  | 'user.status_changed'
  | 'center.reviewed'
  | 'data.deleted'
  | 'payment.refunded';

export type SeverityLevel = 'info' | 'warning' | 'critical';

@Schema({ timestamps: true })
export class SensitiveActionLog {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: SensitiveActionLog;

  @Prop({ required: true, type: String })
  actorId: string;

  @Prop({ required: true, type: String })
  actorRole: string;

  @Prop({
    required: true,
    type: String,
    enum: [
      'auth.login',
      'auth.login_failed',
      'user.status_changed',
      'center.reviewed',
      'data.deleted',
      'payment.refunded',
    ],
  })
  actionType: ActionType;

  @Prop({ required: true, type: String })
  targetType: string;

  @Prop({ required: true, type: String })
  targetId: string;

  @Prop({
    required: true,
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info',
  })
  severity: SeverityLevel;

  @Prop({ required: false, type: String })
  ipAddress?: string;

  @Prop({ required: false, type: String })
  userAgent?: string;

  @Prop({ required: false, type: mongoose.Schema.Types.Mixed, default: {} })
  metadata?: Record<string, unknown>;

  @Prop({ required: true, type: String })
  integrityHash: string;
}

export const SensitiveActionLogSchema =
  SchemaFactory.createForClass(SensitiveActionLog);

SensitiveActionLogSchema.index({ actorId: 1 });
SensitiveActionLogSchema.index({ actionType: 1 });
SensitiveActionLogSchema.index({ severity: 1 });
SensitiveActionLogSchema.index({ createdAt: -1 });
