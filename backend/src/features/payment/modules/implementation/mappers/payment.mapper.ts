import { PaymentEntity } from '@features/payment/domains/entities/payment.entity';
import { PaymentDocument } from '@features/payment/domains/schemas/payment.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentMapper {
  toEntity(doc: PaymentDocument): PaymentEntity {
    return new PaymentEntity(doc._id);
  }
}
