export type BookingStatusDto =
  'pending_payment' | 'confirmed' | 'partial_paid' | 'cancelled' | 'completed';

export interface BookingDetailParticipantDto {
  firstName: string;
  lastName: string;
}

export interface BookingDetailResponseDto {
  bookingId: string;
  status: BookingStatusDto;
  reservationExpiresAt: string | null;
  totalEur: number;
  vatEur: number;
  participants: BookingDetailParticipantDto[];
  activityTitle: string;
  slotStartAt: string;
  waiverSigned: boolean;
}
