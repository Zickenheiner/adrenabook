/** Conditions de participation heritees de l'activite. */
export interface SlotPrerequisites {
  minAge: number;
  maxAge?: number;
  minWeightKg?: number;
  maxWeightKg?: number;
  medicalCertificateRequired: boolean;
}

export interface SlotDetailEntity {
  id: string;
  activityId: string;
  startAt: Date;
  durationMinutes: number;
  maxParticipants: number;
  remainingSeats: number;
  priceEur: number;
  prerequisites?: SlotPrerequisites;
}
