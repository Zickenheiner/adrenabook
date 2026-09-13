export interface SlotPrerequisitesDto {
  minAge: number;
  maxAge?: number;
  minWeightKg?: number;
  maxWeightKg?: number;
  medicalCertificateRequired: boolean;
}

export interface SlotDetailResponseDto {
  id: string;
  activityId: string;
  startAt: string;
  durationMinutes: number;
  maxParticipants: number;
  remainingSeats: number;
  priceEur: number;
  prerequisites?: SlotPrerequisitesDto;
}
