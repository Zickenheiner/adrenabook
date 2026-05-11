import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: User;

  @Prop({
    required: true,
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, type: String, trim: true })
  firstName: string;

  @Prop({ required: true, type: String, trim: true })
  lastName: string;

  @Prop({ required: true, type: Date })
  birthDate: Date;

  @Prop({ required: true, type: Boolean, default: false })
  acceptCgu: boolean;

  @Prop({ required: true, type: Boolean, default: false })
  acceptRgpd: boolean;

  @Prop({ required: true, type: Boolean, default: false })
  emailVerified: boolean;

  @Prop({ required: false, type: String })
  emailVerificationToken?: string;

  @Prop({ required: false, type: String, default: 'Aventurier' })
  role: string;

  // ——— Champs securite US-02 ———

  @Prop({ required: true, type: Number, default: 0 })
  failedLoginAttempts: number;

  @Prop({ required: false, type: Date })
  lockedUntil?: Date;

  @Prop({ required: true, type: Boolean, default: false })
  twoFactorEnabled: boolean;

  @Prop({ required: false, type: String })
  twoFactorCode?: string;

  @Prop({ required: false, type: Date })
  twoFactorCodeExpiresAt?: Date;

  @Prop({ required: false, type: String })
  refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
