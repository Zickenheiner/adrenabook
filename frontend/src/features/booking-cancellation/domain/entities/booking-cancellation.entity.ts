export interface BookingCancellationEntity {
  bookingId: string;
  status: 'cancelled';
  refundedAmountEur: number;
  refundPolicyApplied: 'full' | 'partial' | 'none';
  refundEta: string;
}
