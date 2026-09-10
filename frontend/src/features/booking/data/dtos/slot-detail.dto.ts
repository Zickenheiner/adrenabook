export interface SlotDetailResponseDto {
  id: string;
  activityId: string;
  startAt: string;
  durationMinutes: number;
  maxParticipants: number;
  remainingSeats: number;
  priceEur: number;
}
