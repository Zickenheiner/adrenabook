export interface ProBookingResponseDto {
  bookingId: string;
  activityTitle: string;
  slotStartAt: string;
  durationMinutes: number;
  customerName: string;
  customerEmail: string;
  participantNames: string[];
  participants: number;
  status: string;
  totalEur: number;
  paidAmountEur: number;
  bookedAt: string;
}
