import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ProfessionalCenterDocument = ProfessionalCenter & Document;

@Schema({ _id: false })
export class Address {
  @Prop({ required: true, type: String, trim: true })
  street: string;

  @Prop({ required: true, type: String, trim: true })
  city: string;

  @Prop({ required: true, type: String, trim: true })
  postalCode: string;

  @Prop({ required: true, type: String, trim: true })
  country: string;
}

@Schema({ _id: false })
export class LegalRepresentative {
  @Prop({ required: true, type: String, trim: true })
  firstName: string;

  @Prop({ required: true, type: String, trim: true })
  lastName: string;

  @Prop({ required: true, type: String, trim: true })
  role: string;
}

@Schema({ _id: false })
export class Documents {
  @Prop({ required: true, type: String })
  kbisFileId: string;

  @Prop({ required: true, type: String })
  rcProFileId: string;

  @Prop({ required: true, type: [String], default: [] })
  instructorDiplomas: string[];
}

@Schema({ timestamps: true })
export class ProfessionalCenter {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: ProfessionalCenter;

  @Prop({ required: true, type: String, trim: true })
  companyName: string;

  @Prop({ required: true, type: String, trim: true, unique: true })
  siret: string;

  @Prop({
    required: true,
    type: String,
    lowercase: true,
    trim: true,
  })
  contactEmail: string;

  @Prop({ required: true, type: String, trim: true })
  contactPhone: string;

  @Prop({ required: true, type: Address })
  address: Address;

  @Prop({ required: true, type: LegalRepresentative })
  legalRepresentative: LegalRepresentative;

  @Prop({ required: true, type: Documents })
  documents: Documents;

  @Prop({
    required: true,
    type: String,
    default: 'pending_review',
    enum: ['pending_review', 'approved', 'rejected'],
  })
  status: string;
}

export const ProfessionalCenterSchema =
  SchemaFactory.createForClass(ProfessionalCenter);
