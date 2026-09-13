export interface BookingSummaryDto {
  bookingId: string;
  activityTitle: string;
  centerName: string;
  /** Debut du creneau, tel que l'API le nomme. */
  slotStartAt: string; // ISO 8601
  status: 'confirmed' | 'pending_payment' | 'cancelled';
  coverPhotoUrl: string;
}

export interface ActivitySummaryDto {
  activityId: string;
  title: string;
  type: string;
  priceEur: number;
  durationMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  centerName: string;
  coverPhotoUrl: string;
  rating?: number;
}

export interface DashboardResponseDto {
  firstName: string;
  upcomingBookings: BookingSummaryDto[];
  suggestedActivities: ActivitySummaryDto[];
}
