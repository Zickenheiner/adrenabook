import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CsvImportDocument = CsvImport & Document;

@Schema({ timestamps: true })
export class CsvImport {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: CsvImport;

  @Prop({
    required: true,
    type: String,
    enum: ['slots', 'customers', 'activities'],
  })
  entityType: string;

  @Prop({ required: true, type: String })
  fileId: string;

  @Prop({ required: true, type: Map, of: String })
  columnMapping: Map<string, string>;

  @Prop({ required: true, type: Boolean, default: false })
  dryRun: boolean;

  @Prop({
    required: true,
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued',
  })
  status: string;

  @Prop({ type: Number, default: 0 })
  rowsTotal: number;

  @Prop({ type: Number, default: 0 })
  rowsSuccess: number;

  @Prop({ type: Number, default: 0 })
  rowsErrors: number;

  @Prop({
    type: [
      {
        line: { type: Number, required: true },
        column: { type: String, required: true },
        reason: { type: String, required: true },
      },
    ],
    default: [],
  })
  errors: { line: number; column: string; reason: string }[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  professionalId: mongoose.Types.ObjectId;
}

export const CsvImportSchema = SchemaFactory.createForClass(CsvImport);
