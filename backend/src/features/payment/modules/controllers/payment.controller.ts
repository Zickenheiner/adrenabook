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
    summary: 'Webhook Stripe (US-12)',
    description:
      "Endpoint Stripe webhook. Reçoit les événements signés par Stripe et traite : payment_intent.succeeded, payment_intent.payment_failed, charge.refunded. L'authentification est assurée par la signature Stripe (header Stripe-Signature).",
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook traite avec succes',
  })
  @ApiResponse({
    status: 400,
    description: 'Signature Stripe invalide ou payload malformate',
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
