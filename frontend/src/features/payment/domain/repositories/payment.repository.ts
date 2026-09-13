import type { PaymentConfirmationEntity } from '../entities/payment.entity';
import type {
  ConfirmPaymentRequestDto,
  PaymentIntentResponseDto,
} from '../../data/dtos/payment.dto';

export interface PaymentRepository {
  createIntent(bookingId: string): Promise<PaymentIntentResponseDto>;
  confirmPayment(
    bookingId: string,
    data: ConfirmPaymentRequestDto,
  ): Promise<PaymentConfirmationEntity>;
}
