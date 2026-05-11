import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '../schemas/payment.schema';

export class PaymentEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the payment',
  })
  private readonly id: Payment;

  constructor(_id: Payment) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): Payment {
    return this.id;
  }

  //———————SETTER———————
}
