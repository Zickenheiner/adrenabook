import { ApiProperty } from '@nestjs/swagger';
import { Invoice } from '../schemas/invoice.schema';
import mongoose from 'mongoose';

export class InvoiceEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the invoice',
  })
  private readonly id: Invoice;

  private bookingId: mongoose.Types.ObjectId;
  private userId: mongoose.Types.ObjectId;
  private invoiceNumber: string;
  private issuedAt: Date;
  private totalEur: number;
  private vatEur: number;

  constructor(_id: Invoice) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): Invoice {
    return this.id;
  }

  getBookingId(): mongoose.Types.ObjectId {
    return this.bookingId;
  }

  getUserId(): mongoose.Types.ObjectId {
    return this.userId;
  }

  getInvoiceNumber(): string {
    return this.invoiceNumber;
  }

  getIssuedAt(): Date {
    return this.issuedAt;
  }

  getTotalEur(): number {
    return this.totalEur;
  }

  getVatEur(): number {
    return this.vatEur;
  }

  // ———————SETTER———————

  setBookingId(value: mongoose.Types.ObjectId): void {
    this.bookingId = value;
  }

  setUserId(value: mongoose.Types.ObjectId): void {
    this.userId = value;
  }

  setInvoiceNumber(value: string): void {
    this.invoiceNumber = value;
  }

  setIssuedAt(value: Date): void {
    this.issuedAt = value;
  }

  setTotalEur(value: number): void {
    this.totalEur = value;
  }

  setVatEur(value: number): void {
    this.vatEur = value;
  }
}
