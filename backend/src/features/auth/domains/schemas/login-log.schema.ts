import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type LoginLogDocument = LoginLog & Document;

/**
 * LoginLog — Journal des tentatives de connexion (US-02)
 * Permet de tracer les connexions reussies et echouees pour audit/securite.
 */
@Schema({ timestamps: true })
export class LoginLog {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: LoginLog;

  @Prop({ required: true, type: String, lowercase: true, trim: true })
  email: string;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  userId?: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Boolean, default: false })
  success: boolean;

  @Prop({ required: false, type: String })
  ipAddress?: string;

  @Prop({ required: false, type: String })
  userAgent?: string;

  @Prop({ required: false, type: String })
  reason?: string;
}

export const LoginLogSchema = SchemaFactory.createForClass(LoginLog);
