import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import type { PaymentConfirmationEntity } from '../../domain/entities/payment.entity';
import type { ConfirmPaymentRequestDto } from '../dtos/payment.dto';
import PaymentApi from '../datasources/payment.api';
import PaymentMapper from '../mappers/payment.mapper';

class PaymentRepositoryImpl implements PaymentRepository {
  constructor(
    private readonly paymentApi: PaymentApi = new PaymentApi(),
    private readonly paymentMapper: PaymentMapper = new PaymentMapper(),
  ) {}

  async confirmPayment(
    bookingId: string,
    data: ConfirmPaymentRequestDto,
  ): Promise<PaymentConfirmationEntity> {
    const dto = await this.paymentApi.confirmPayment(bookingId, data);
    return this.paymentMapper.toEntity(dto);
  }
}

export default PaymentRepositoryImpl;
