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

  // ——— Statut admin US-22 ———

  @Prop({
    required: true,
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active',
  })
  status: string;

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

  // ——— Champs reinitialisation mot de passe US-03 ———

  @Prop({ required: false, type: String })
  passwordResetTokenHash?: string;

  @Prop({ required: false, type: Date })
  passwordResetTokenExpiresAt?: Date;

  // ——— Profil de sante US-05 ———

  @Prop({
    required: false,
    type: {
      weight: { type: Number, required: false },
      height: { type: Number, required: false },
      medicalContraindications: { type: [String], required: false },
      emergencyContact: {
        fullName: { type: String, required: false },
        relation: { type: String, required: false },
        phone: { type: String, required: false },
      },
      medicalCertificateFileId: { type: String, required: false },
    },
    _id: false,
  })
  healthProfile?: {
    weight?: number;
    height?: number;
    medicalContraindications?: string[];
    emergencyContact?: {
      fullName: string;
      relation: string;
      phone: string;
    };
    medicalCertificateFileId?: string;
  };

  // ——— RGPD US-24 ———

  @Prop({
    required: false,
    type: {
      requestId: { type: String, required: false },
      type: {
        type: String,
        required: false,
        enum: ['export', 'delete'],
      },
      status: {
        type: String,
        required: false,
        enum: ['queued', 'processing', 'ready', 'scheduled'],
      },
      requestedAt: { type: Date, required: false },
      scheduledDeletionAt: { type: Date, required: false },
      confirmationCode: { type: String, required: false },
      confirmationCodeExpiresAt: { type: Date, required: false },
    },
    _id: false,
  })
  rgpdRequest?: {
    requestId: string;
    type: 'export' | 'delete';
    status: 'queued' | 'processing' | 'ready' | 'scheduled';
    requestedAt: Date;
    scheduledDeletionAt?: Date;
    confirmationCode?: string;
    confirmationCodeExpiresAt?: Date;
  };

  // ——— Preferences de notifications US-14 ———

  @Prop({
    required: false,
    type: {
      email: {
        bookingConfirmation: { type: Boolean, required: false, default: true },
        reminders: { type: Boolean, required: false, default: true },
        marketing: { type: Boolean, required: false, default: false },
      },
      sms: {
        bookingConfirmation: { type: Boolean, required: false, default: true },
        reminders: { type: Boolean, required: false, default: true },
      },
    },
    _id: false,
  })
  notificationPreferences?: {
    email: {
      bookingConfirmation: boolean;
      reminders: boolean;
      marketing: boolean;
    };
    sms: {
      bookingConfirmation: boolean;
      reminders: boolean;
    };
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
