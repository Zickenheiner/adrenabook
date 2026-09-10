export interface BookingParticipantDto {
  firstName: string;
  lastName: string;
  birthDate: string;
  weightKg?: number;
}

export interface CreateBookingRequestDto {
  slotId: string;
  participants: BookingParticipantDto[];
  acceptCenterTerms: boolean;
}

export interface BookingResponseDto {
  bookingId: string;
  status: 'pending_payment';
  reservationExpiresAt: string; // ISO 8601, +15 min
  totalEur: number;
  vatEur: number;
  paymentIntentClientSecret: string; // pour Stripe
}
