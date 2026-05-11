export interface SlotSummaryEntity {
  id: string;
  startAt: Date;
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
