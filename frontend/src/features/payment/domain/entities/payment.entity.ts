export interface PaymentConfirmationEntity {
  bookingId: string;
  status: 'confirmed' | 'partial_paid';
  paidAmountEur: number;
  remainingAmountEur: number;
  finalPaymentDueAt?: Date;
}
