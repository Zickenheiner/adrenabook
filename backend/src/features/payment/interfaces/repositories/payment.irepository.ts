import {
  CreatePaymentDto,
  UpdatePaymentDto,
} from '@features/payment/domains/dtos/payment.dto';
import { PaymentEntity } from '@features/payment/domains/entities/payment.entity';

export interface IPaymentRepository {
  findAll(): Promise<PaymentEntity[] | null>;
  findById(id: string): Promise<PaymentEntity | null>;
  create(dto: CreatePaymentDto): Promise<boolean>;
  update(id: string, dto: UpdatePaymentDto): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
