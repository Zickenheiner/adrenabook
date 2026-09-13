export interface PaymentIntentResponseDto {
  bookingId: string;
  paymentIntentId: string;
  amountEur: number;
  /** Vrai tant que le paiement n'est pas encaissé par Stripe. */
  simulated: boolean;
}

export interface ConfirmPaymentRequestDto {
  paymentIntentId: string;
}

export interface ConfirmPaymentResponseDto {
  bookingId: string;
  status: 'confirmed' | 'partial_paid';
  paidAmountEur: number;
  remainingAmountEur: number;
}
