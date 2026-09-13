export interface ActivityDetailResponseDto {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  durationMinutes: number;
  priceEur: number;
  prerequisites: {
    minAge: number;
    maxAge?: number;
    minWeightKg?: number;
    maxWeightKg?: number;
    medicalCertificateRequired: boolean;
  };
  includedEquipment: string[];
  photos: { url: string; alt: string }[];
  videos: { url: string; thumbnail: string }[];
  center: {
    id: string;
    name: string;
    location: { lat: number; lng: number; address: string };
  };
  reviewsSummary: { count: number; averageRating: number };
}

export interface ActivityMonthSlotsResponseDto {
  slots: {
    id: string;
    startAt: string;
    remainingSeats: number;
    priceEur: number;
  }[];
  /** Mois à venir comportant au moins un créneau, au format YYYY-MM. */
  availableMonths: string[];
}
