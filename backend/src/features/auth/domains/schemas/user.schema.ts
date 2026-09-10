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

  // Roles normalises en minuscules : 'aventurier' | 'professionnel' | 'admin'
  // (`lowercase: true` garantit la coherence avec le payload JWT)
  @Prop({
    required: false,
    type: String,
    default: 'aventurier',
    lowercase: true,
  })
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
      weight: { type: Number },
      height: { type: Number },
      medicalContraindications: { type: [String] },
      emergencyContact: {
        fullName: { type: String },
        relation: { type: String },
        phone: { type: String },
      },
      medicalCertificateFileId: { type: String },
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
      requestId: { type: String },
      requestType: {
        type: String,
        enum: ['export', 'delete'],
      },
      status: {
        type: String,
        enum: ['queued', 'processing', 'ready', 'scheduled', 'completed'],
      },
      requestedAt: { type: Date },
      completedAt: { type: Date },
      scheduledDeletionAt: { type: Date },
      confirmationCode: { type: String },
      confirmationCodeExpiresAt: { type: Date },
    },
    _id: false,
  })
  rgpdRequest?: {
    requestId: string;
    requestType: 'export' | 'delete';
    status: 'queued' | 'processing' | 'ready' | 'scheduled' | 'completed';
    requestedAt: Date;
    completedAt?: Date;
    scheduledDeletionAt?: Date;
    confirmationCode?: string;
    confirmationCodeExpiresAt?: Date;
  };

  // ——— Preferences de notifications US-14 ———

  @Prop({
    required: false,
    type: {
      email: {
        bookingConfirmation: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
      },
      sms: {
        bookingConfirmation: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true },
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
