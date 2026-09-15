import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '@core/decorators/public.decorator';
import { IPaymentService } from '@features/payment/interfaces/services/payment.iservice';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(
    @Inject('IPaymentService')
    private readonly paymentService: IPaymentService,
  ) {}

  @Public()
  @ApiOperation({
    summary: 'Stripe webhook',
    description:
      'Stripe webhook endpoint. Receives the events signed by Stripe and handles: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded. Authentication is provided by the Stripe signature (Stripe-Signature header).',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid Stripe signature or malformed payload',
  })
  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<void> {
    await this.paymentService.handleStripeWebhook(req.rawBody!, signature);
  }
}
