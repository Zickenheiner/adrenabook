import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ActivityDocument = Activity & Document;

@Schema({ _id: false })
export class Prerequisites {
  @Prop({ required: true, type: Number })
  minAge: number;

  @Prop({ required: false, type: Number })
  maxAge?: number;

  @Prop({ required: false, type: Number })
  minWeightKg?: number;

  @Prop({ required: false, type: Number })
  maxWeightKg?: number;

  @Prop({ required: true, type: Boolean })
  medicalCertificateRequired: boolean;
}

@Schema({ timestamps: true })
export class Activity {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: Activity;

  @Prop({ required: true, type: String, trim: true })
  title: string;

  @Prop({ required: true, type: String, trim: true })
  description: string;

  @Prop({ required: true, type: String, trim: true })
  type: string;

  @Prop({
    required: true,
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  difficulty: string;

  @Prop({ required: true, type: Number })
  durationMinutes: number;

  @Prop({ required: true, type: Number })
  priceFromEur: number;

  @Prop({ required: true, type: Prerequisites })
  prerequisites: Prerequisites;

  @Prop({ required: true, type: [String], default: [] })
  includedEquipment: string[];

  @Prop({ required: true, type: [String], default: [] })
  photoFileIds: string[];

  @Prop({
    required: true,
    type: String,
    default: 'draft',
    enum: ['draft', 'pending_admin_review', 'published', 'archived'],
  })
  status: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProfessionalCenter',
  })
  centerId: mongoose.Types.ObjectId;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
