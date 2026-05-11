export interface RecurrenceDto {
  rrule: string; // RFC 5545 RRULE
  untilDate: string;
}

export interface CreateSlotRequestDto {
  recurrence?: RecurrenceDto;
  singleStartAt?: string;
  durationMinutes: number;
  maxParticipants: number;
  priceEur: number;
  instructorIds: string[];
}

export interface SlotSummaryDto {
  id: string;
  startAt: string;
}

export interface SlotConflictDto {
  startAt: string;
  reason: string;
}

export interface CreateSlotsResponseDto {
  createdCount: number;
  slots: SlotSummaryDto[];
  conflicts: SlotConflictDto[];
}
