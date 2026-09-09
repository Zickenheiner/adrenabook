import { ApiProperty } from '@nestjs/swagger';
import { Waiver } from '../schemas/waiver.schema';
import mongoose from 'mongoose';

export class WaiverEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the waiver',
  })
  private readonly id: Waiver;

  private bookingId: mongoose.Types.ObjectId;
  private userId: mongoose.Types.ObjectId;
  private signatureMethod: string;
  private signaturePayload: string;
  private acknowledgedRisks: boolean;
  private documentHash: string;
  private signedAt: Date;
  private downloadUrl?: string;

  constructor(_id: Waiver) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): Waiver {
    return this.id;
  }

  getBookingId(): mongoose.Types.ObjectId {
    return this.bookingId;
  }

  getUserId(): mongoose.Types.ObjectId {
    return this.userId;
  }

  getSignatureMethod(): string {
    return this.signatureMethod;
  }

  getSignaturePayload(): string {
    return this.signaturePayload;
  }

  getAcknowledgedRisks(): boolean {
    return this.acknowledgedRisks;
  }

  getDocumentHash(): string {
    return this.documentHash;
  }

  getSignedAt(): Date {
    return this.signedAt;
  }

  getDownloadUrl(): string | undefined {
    return this.downloadUrl;
  }

  // ———————SETTER———————

  setBookingId(value: mongoose.Types.ObjectId): void {
    this.bookingId = value;
  }

  setUserId(value: mongoose.Types.ObjectId): void {
    this.userId = value;
  }

  setSignatureMethod(value: string): void {
    this.signatureMethod = value;
  }

  setSignaturePayload(value: string): void {
    this.signaturePayload = value;
  }

  setAcknowledgedRisks(value: boolean): void {
    this.acknowledgedRisks = value;
  }

  setDocumentHash(value: string): void {
    this.documentHash = value;
  }

  setSignedAt(value: Date): void {
    this.signedAt = value;
  }

  setDownloadUrl(value: string | undefined): void {
    this.downloadUrl = value;
  }
}
