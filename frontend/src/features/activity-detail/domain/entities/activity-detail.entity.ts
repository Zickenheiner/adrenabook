export interface ActivityDetailPrerequisites {
  minAge: number;
  maxAge?: number;
  minWeightKg?: number;
  maxWeightKg?: number;
  medicalCertificateRequired: boolean;
}

export interface ActivityDetailPhoto {
  url: string;
  alt: string;
}

export interface ActivityDetailVideo {
  url: string;
  thumbnail: string;
}

export interface ActivityDetailCenter {
  id: string;
  name: string;
  location: { lat: number; lng: number; address: string };
}

export interface ActivityDetailSlot {
  id: string;
  startAt: Date;
  remainingSeats: number;
  priceEur: number;
}

export interface ActivityDetailReviewsSummary {
  count: number;
  averageRating: number;
}

export interface ActivityDetailEntity {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  durationMinutes: number;
  priceFromEur: number;
  prerequisites: ActivityDetailPrerequisites;
  includedEquipment: string[];
  photos: ActivityDetailPhoto[];
  videos: ActivityDetailVideo[];
  center: ActivityDetailCenter;
  upcomingSlots: ActivityDetailSlot[];
  reviewsSummary: ActivityDetailReviewsSummary;
}
