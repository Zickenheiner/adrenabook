import { Module } from '@nestjs/common';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './implementation/services/payment.service';

@Module({
  controllers: [PaymentController],
  providers: [
    {
      provide: 'IPaymentService',
      useClass: PaymentService,
    },
  ],
  exports: ['IPaymentService'],
})
export class PaymentBaseModule {}
