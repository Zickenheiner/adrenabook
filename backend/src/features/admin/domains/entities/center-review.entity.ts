import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { CenterReview } from '../schemas/center-review.schema';

export class CenterReviewEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the center review',
  })
  private readonly id: CenterReview;

  private centerId: mongoose.Types.ObjectId;
  private decision: string;
  private internalComment: string;
  private rejectionReason: string;
  private publicComment: string;
  private reviewedBy: mongoose.Types.ObjectId;
  private notificationSent: boolean;

  constructor(_id: CenterReview) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): CenterReview {
    return this.id;
  }

  getCenterId(): mongoose.Types.ObjectId {
    return this.centerId;
  }

  getDecision(): string {
    return this.decision;
  }

  getInternalComment(): string {
    return this.internalComment;
  }

  getRejectionReason(): string {
    return this.rejectionReason;
  }

  getPublicComment(): string {
    return this.publicComment;
  }

  getReviewedBy(): mongoose.Types.ObjectId {
    return this.reviewedBy;
  }

  getNotificationSent(): boolean {
    return this.notificationSent;
  }

  // ———————SETTER———————

  setCenterId(value: mongoose.Types.ObjectId): void {
    this.centerId = value;
  }

  setDecision(value: string): void {
    this.decision = value;
  }

  setInternalComment(value: string): void {
    this.internalComment = value;
  }

  setRejectionReason(value: string): void {
    this.rejectionReason = value;
  }

  setPublicComment(value: string): void {
    this.publicComment = value;
  }

  setReviewedBy(value: mongoose.Types.ObjectId): void {
    this.reviewedBy = value;
  }

  setNotificationSent(value: boolean): void {
    this.notificationSent = value;
  }
}
