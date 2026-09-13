export interface SlotSummaryEntity {
  id: string;
  startAt: Date;
}

export interface ProSlotMonthEntity {
  slots: ProSlotEntity[];
  availableMonths: string[];
}

export interface ProSlotEntity {
  id: string;
  startAt: Date;
  durationMinutes: number;
  maxParticipants: number;
  remainingSeats: number;
  priceEur: number;
}

export interface SlotConflictEntity {
  startAt: Date;
  reason: string;
}

export interface CreateSlotsResultEntity {
  createdCount: number;
  slots: SlotSummaryEntity[];
  conflicts: SlotConflictEntity[];
}
