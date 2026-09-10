export interface IPaymentService {
  handleStripeWebhook(payload: Buffer, signature: string): Promise<void>;
}
