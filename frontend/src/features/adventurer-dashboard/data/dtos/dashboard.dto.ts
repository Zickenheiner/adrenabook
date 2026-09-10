export interface BookingSummaryDto {
  bookingId: string;
  activityTitle: string;
  centerName: string;
  date: string; // ISO 8601
  status: 'confirmed' | 'pending_payment' | 'cancelled';
  coverPhotoUrl: string;
}

export interface ActivitySummaryDto {
  id: string;
  title: string;
  type: string;
  priceFromEur: number;
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
