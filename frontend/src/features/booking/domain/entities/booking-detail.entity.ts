export type BookingStatus =
  'pending_payment' | 'confirmed' | 'partial_paid' | 'cancelled' | 'completed';

export interface BookingDetailParticipant {
  firstName: string;
  lastName: string;
}

export interface BookingDetailEntity {
  bookingId: string;
  status: BookingStatus;
  reservationExpiresAt: Date | null;
  totalEur: number;
  vatEur: number;
  participants: BookingDetailParticipant[];
  activityTitle: string;
  slotStartAt: Date;
  waiverSigned: boolean;
}
