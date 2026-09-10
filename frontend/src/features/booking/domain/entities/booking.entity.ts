export interface BookingParticipant {
  firstName: string;
  lastName: string;
  birthDate: string;
  weightKg?: number;
}

export interface BookingEntity {
  bookingId: string;
  status: 'pending_payment';
  reservationExpiresAt: Date;
  totalEur: number;
  vatEur: number;
  paymentIntentClientSecret: string;
}
