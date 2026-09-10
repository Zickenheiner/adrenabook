export interface ActivityDetailResponseDto {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  durationMinutes: number;
  priceFromEur: number;
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
  upcomingSlots: {
    id: string;
    startAt: string;
    remainingSeats: number;
    priceEur: number;
  }[];
  reviewsSummary: { count: number; averageRating: number };
}
