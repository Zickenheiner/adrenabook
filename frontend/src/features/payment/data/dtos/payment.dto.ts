export interface ConfirmPaymentRequestDto {
  paymentIntentId: string;
}

export interface ConfirmPaymentResponseDto {
  bookingId: string;
  status: 'confirmed' | 'partial_paid';
  paidAmountEur: number;
  remainingAmountEur: number;
  finalPaymentDueAt?: string; // ISO 8601, J-7
}
