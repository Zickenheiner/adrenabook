import type { PaymentConfirmationEntity } from '../../domain/entities/payment.entity';
import type { ConfirmPaymentResponseDto } from '../dtos/payment.dto';

class PaymentMapper {
  toEntity(dto: ConfirmPaymentResponseDto): PaymentConfirmationEntity {
    return {
      bookingId: dto.bookingId,
      status: dto.status,
      paidAmountEur: dto.paidAmountEur,
      remainingAmountEur: dto.remainingAmountEur,
      finalPaymentDueAt: dto.finalPaymentDueAt
        ? new Date(dto.finalPaymentDueAt)
        : undefined,
    };
  }
}

export default PaymentMapper;
