import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { AccountingExport } from '../schemas/accounting-export.schema';

export class AccountingExportEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the accounting export',
  })
  private readonly id: AccountingExport;

  private format: string;
  private from: Date;
  private to: Date;
  private includeRefunds: boolean;
  private deliveryMode: string;
  private status: string;
  private downloadUrl?: string;
  private emailDeliveredTo?: string;
  private recordsCount: number;
  private professionalId: mongoose.Types.ObjectId;

  constructor(_id: AccountingExport) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): AccountingExport {
    return this.id;
  }

  getFormat(): string {
    return this.format;
  }

  getFrom(): Date {
    return this.from;
  }

  getTo(): Date {
    return this.to;
  }

  getIncludeRefunds(): boolean {
    return this.includeRefunds;
  }

  getDeliveryMode(): string {
    return this.deliveryMode;
  }

  getStatus(): string {
    return this.status;
  }

  getDownloadUrl(): string | undefined {
    return this.downloadUrl;
  }

  getEmailDeliveredTo(): string | undefined {
    return this.emailDeliveredTo;
  }

  getRecordsCount(): number {
    return this.recordsCount;
  }

  getProfessionalId(): mongoose.Types.ObjectId {
    return this.professionalId;
  }

  // ———————SETTER———————

  setFormat(value: string): void {
    this.format = value;
  }

  setFrom(value: Date): void {
    this.from = value;
  }

  setTo(value: Date): void {
    this.to = value;
  }

  setIncludeRefunds(value: boolean): void {
    this.includeRefunds = value;
  }

  setDeliveryMode(value: string): void {
    this.deliveryMode = value;
  }

  setStatus(value: string): void {
    this.status = value;
  }

  setDownloadUrl(value: string | undefined): void {
    this.downloadUrl = value;
  }

  setEmailDeliveredTo(value: string | undefined): void {
    this.emailDeliveredTo = value;
  }

  setRecordsCount(value: number): void {
    this.recordsCount = value;
  }

  setProfessionalId(value: mongoose.Types.ObjectId): void {
    this.professionalId = value;
  }
}
