import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CenterDocument = Center & Document;

@Schema({ timestamps: true })
export class Center {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: Center;

  @Prop({ required: true, type: String, trim: true })
  name: string;

  @Prop({ required: true, type: Number })
  lat: number;

  @Prop({ required: true, type: Number })
  lng: number;

  @Prop({ required: false, type: String, default: '' })
  city: string;

  @Prop({ required: false, type: [String], default: [] })
  activityTypes: string[];

  @Prop({ required: false, type: Number, default: 0 })
  activitiesCount: number;
}

export const CenterSchema = SchemaFactory.createForClass(Center);
