export interface CancelBookingRequestDto {
  reason: 'personal' | 'health' | 'weather' | 'other';
  comment?: string;
}

export interface CancelBookingResponseDto {
  bookingId: string;
  status: 'cancelled';
  refundedAmountEur: number;
  refundPolicyApplied: 'full' | 'partial' | 'none';
  refundEta: string;
}
