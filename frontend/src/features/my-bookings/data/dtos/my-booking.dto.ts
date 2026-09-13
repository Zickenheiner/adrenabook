export interface MyBookingResponseDto {
  bookingId: string;
  activityTitle: string;
  activityId: string;
  centerName: string;
  centerAddress: string;
  slotStartAt: string;
  durationMinutes: number;
  participants: number;
  status: string;
  totalEur: number;
  paidAmountEur: number;
  remainingAmountEur: number;
  waiverSigned: boolean;
  /** Identifiant de fichier, a resoudre via resolvePhotoUrl(). */
  coverPhotoUrl: string;
  reservationExpiresAt?: string;
}
