import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { Slot } from '../schemas/slot.schema';

export class SlotEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the slot',
  })
  private readonly id: Slot;

  private activityId: mongoose.Types.ObjectId;
  private startAt: Date;
  private durationMinutes: number;
  private maxParticipants: number;
  private priceEur: number;
  private instructorIds: string[];
  private recurrence?: { rrule: string; untilDate: string };

  constructor(_id: Slot) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): Slot {
    return this.id;
  }

  getActivityId(): mongoose.Types.ObjectId {
    return this.activityId;
  }

  getStartAt(): Date {
    return this.startAt;
  }

  getDurationMinutes(): number {
    return this.durationMinutes;
  }

  getMaxParticipants(): number {
    return this.maxParticipants;
  }

  getPriceEur(): number {
    return this.priceEur;
  }

  getInstructorIds(): string[] {
    return this.instructorIds;
  }

  getRecurrence(): { rrule: string; untilDate: string } | undefined {
    return this.recurrence;
  }

  // ———————SETTER———————

  setActivityId(value: mongoose.Types.ObjectId): void {
    this.activityId = value;
  }

  setStartAt(value: Date): void {
    this.startAt = value;
  }

  setDurationMinutes(value: number): void {
    this.durationMinutes = value;
  }

  setMaxParticipants(value: number): void {
    this.maxParticipants = value;
  }

  setPriceEur(value: number): void {
    this.priceEur = value;
  }

  setInstructorIds(value: string[]): void {
    this.instructorIds = value;
  }

  setRecurrence(value: { rrule: string; untilDate: string } | undefined): void {
    this.recurrence = value;
  }
}
