export type BookingStatus =
  'pending_payment' | 'partial_paid' | 'confirmed' | 'cancelled';

export interface MyBookingEntity {
  bookingId: string;
  activityTitle: string;
  activityId: string;
  centerName: string;
  centerAddress: string;
  startAt: Date;
  durationMinutes: number;
  participants: number;
  status: BookingStatus;
  totalEur: number;
  paidAmountEur: number;
  remainingAmountEur: number;
  waiverSigned: boolean;
  coverPhotoUrl: string;
  reservationExpiresAt?: Date;
}
