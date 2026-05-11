import type { PaymentConfirmationEntity } from '../entities/payment.entity';
import type { ConfirmPaymentRequestDto } from '../../data/dtos/payment.dto';

export interface PaymentRepository {
  confirmPayment(
    bookingId: string,
    data: ConfirmPaymentRequestDto,
  ): Promise<PaymentConfirmationEntity>;
}
