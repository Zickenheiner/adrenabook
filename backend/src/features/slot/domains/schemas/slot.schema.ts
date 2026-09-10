import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type SlotDocument = Slot & Document;

@Schema({ _id: false })
export class RecurrenceRule {
  @Prop({ required: true, type: String })
  rrule: string;

  @Prop({ required: true, type: String })
  untilDate: string;
}

@Schema({ timestamps: true })
export class Slot {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: Slot;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
  })
  activityId: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Date })
  startAt: Date;

  @Prop({ required: true, type: Number })
  durationMinutes: number;

  @Prop({ required: true, type: Number })
  maxParticipants: number;

  @Prop({ required: true, type: Number })
  priceEur: number;

  @Prop({ required: true, type: [String], default: [] })
  instructorIds: string[];

  @Prop({ required: false, type: RecurrenceRule })
  recurrence?: RecurrenceRule;
}

export const SlotSchema = SchemaFactory.createForClass(Slot);
