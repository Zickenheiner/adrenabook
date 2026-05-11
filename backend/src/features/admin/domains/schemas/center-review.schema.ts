import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CenterReviewDocument = CenterReview & Document;

@Schema({ timestamps: true })
export class CenterReview {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: CenterReview;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProfessionalCenter',
    required: true,
  })
  centerId: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    enum: ['approve', 'reject', 'request_more_info'],
  })
  decision: string;

  @Prop({ required: false, type: String })
  internalComment: string;

  @Prop({
    required: false,
    type: String,
    enum: ['incomplete_kbis', 'invalid_diploma', 'expired_insurance', 'other'],
  })
  rejectionReason: string;

  @Prop({ required: false, type: String })
  publicComment: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  reviewedBy: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Boolean, default: false })
  notificationSent: boolean;
}

export const CenterReviewSchema = SchemaFactory.createForClass(CenterReview);
