export type ProBookingStatus =
  'pending_payment' | 'partial_paid' | 'confirmed' | 'cancelled';

export interface ProBookingEntity {
  bookingId: string;
  activityTitle: string;
  startAt: Date;
  durationMinutes: number;
  customerName: string;
  customerEmail: string;
  participantNames: string[];
  participants: number;
  status: ProBookingStatus;
  totalEur: number;
  paidAmountEur: number;
  bookedAt: Date;
}
