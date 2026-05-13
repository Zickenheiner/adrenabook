export interface BookingSummaryEntity {
  bookingId: string;
  activityTitle: string;
  centerName: string;
  date: Date;
  status: 'confirmed' | 'pending_payment' | 'cancelled';
  coverPhotoUrl: string;
}

export interface ActivitySummaryEntity {
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

export interface DashboardEntity {
  firstName: string;
  upcomingBookings: BookingSummaryEntity[];
  suggestedActivities: ActivitySummaryEntity[];
}
