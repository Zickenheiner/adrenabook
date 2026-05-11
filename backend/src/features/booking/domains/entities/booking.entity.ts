import { ApiProperty } from '@nestjs/swagger';
import { Booking, Participant } from '../schemas/booking.schema';
import mongoose from 'mongoose';

export class BookingEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the booking',
  })
  private readonly id: Booking;

  private slotId: mongoose.Types.ObjectId;
  private userId: mongoose.Types.ObjectId;
  private participants: Participant[];
  private acceptCenterTerms: boolean;
  private status: string;
  private reservationExpiresAt: Date;
  private totalEur: number;
  private vatEur: number;
  private paymentIntentClientSecret: string;
  private stripePaymentIntentId?: string;
  private paidAmountEur?: number;
  private remainingAmountEur?: number;
  private finalPaymentDueAt?: Date;

  constructor(_id: Booking) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): Booking {
    return this.id;
  }

  getSlotId(): mongoose.Types.ObjectId {
    return this.slotId;
  }

  getUserId(): mongoose.Types.ObjectId {
    return this.userId;
  }

  getParticipants(): Participant[] {
    return this.participants;
  }

  getAcceptCenterTerms(): boolean {
    return this.acceptCenterTerms;
  }

  getStatus(): string {
    return this.status;
  }

  getReservationExpiresAt(): Date {
    return this.reservationExpiresAt;
  }

  getTotalEur(): number {
    return this.totalEur;
  }

  getVatEur(): number {
    return this.vatEur;
  }

  getPaymentIntentClientSecret(): string {
    return this.paymentIntentClientSecret;
  }

  // ———————SETTER———————

  setSlotId(value: mongoose.Types.ObjectId): void {
    this.slotId = value;
  }

  setUserId(value: mongoose.Types.ObjectId): void {
    this.userId = value;
  }

  setParticipants(value: Participant[]): void {
    this.participants = value;
  }

  setAcceptCenterTerms(value: boolean): void {
    this.acceptCenterTerms = value;
  }

  setStatus(value: string): void {
    this.status = value;
  }

  setReservationExpiresAt(value: Date): void {
    this.reservationExpiresAt = value;
  }

  setTotalEur(value: number): void {
    this.totalEur = value;
  }

  setVatEur(value: number): void {
    this.vatEur = value;
  }

  setPaymentIntentClientSecret(value: string): void {
    this.paymentIntentClientSecret = value;
  }

  getStripePaymentIntentId(): string | undefined {
    return this.stripePaymentIntentId;
  }

  getPaidAmountEur(): number | undefined {
    return this.paidAmountEur;
  }

  getRemainingAmountEur(): number | undefined {
    return this.remainingAmountEur;
  }

  getFinalPaymentDueAt(): Date | undefined {
    return this.finalPaymentDueAt;
  }

  // ———————SETTER (new fields)———————

  setStripePaymentIntentId(value: string): void {
    this.stripePaymentIntentId = value;
  }

  setPaidAmountEur(value: number): void {
    this.paidAmountEur = value;
  }

  setRemainingAmountEur(value: number): void {
    this.remainingAmountEur = value;
  }

  setFinalPaymentDueAt(value: Date): void {
    this.finalPaymentDueAt = value;
  }
}
