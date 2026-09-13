export interface RecurrenceDto {
  rrule: string; // RFC 5545 RRULE
  untilDate?: string;
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

export interface ProSlotDto {
  id: string;
  startAt: string;
  durationMinutes: number;
  maxParticipants: number;
  remainingSeats: number;
  priceEur: number;
}

export interface UpdateSlotRequestDto {
  startAt?: string;
  maxParticipants?: number;
}

export interface ProSlotMonthResponseDto {
  slots: ProSlotDto[];
  /** Mois comportant au moins un créneau, passés inclus, au format YYYY-MM. */
  availableMonths: string[];
}

export interface CreateSlotsResponseDto {
  createdCount: number;
  slots: SlotSummaryDto[];
  conflicts: SlotConflictDto[];
}
