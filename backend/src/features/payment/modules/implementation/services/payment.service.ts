import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentService } from '../../../interfaces/services/payment.iservice';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const StripeLib = require('stripe');

@Injectable()
export class PaymentService implements IPaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly stripe: {
    webhooks: {
      constructEvent: (
        payload: Buffer,
        signature: string,
        secret: string,
      ) => { type: string; data: { object: { id: string } } };
    };
  };
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecret) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new StripeLib(stripeSecret, {
      apiVersion: '2026-04-22.dahlia',
    });

    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }
    this.webhookSecret = webhookSecret;
  }

  async handleStripeWebhook(payload: Buffer, signature: string): Promise<void> {
    let event: { type: string; data: { object: { id: string } } };

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    } catch {
      throw new BadRequestException('Signature Stripe invalide');
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        this.logger.log(`PaymentIntent succeeded: ${event.data.object.id}`);
        break;

      case 'payment_intent.payment_failed':
        this.logger.warn(`PaymentIntent failed: ${event.data.object.id}`);
        break;

      case 'charge.refunded':
        this.logger.log(`Charge refunded: ${event.data.object.id}`);
        break;

      default:
        this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }
  }
}
