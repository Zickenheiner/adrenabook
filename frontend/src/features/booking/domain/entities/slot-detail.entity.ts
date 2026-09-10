export interface SlotDetailEntity {
  id: string;
  activityId: string;
  startAt: Date;
  durationMinutes: number;
  maxParticipants: number;
  remainingSeats: number;
  priceEur: number;
}
