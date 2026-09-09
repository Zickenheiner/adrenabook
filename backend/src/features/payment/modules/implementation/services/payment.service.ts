import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentService } from '../../../interfaces/services/payment.iservice';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const StripeLib = require('stripe');

/**
 * Reception des evenements Stripe (US-12).
 *
 * Cet endpoint est le seul du backend a ne pas etre protege par un JWT :
 * l'appelant est Stripe, pas un utilisateur. L'authentification repose
 * entierement sur la signature HMAC-SHA256 posee par Stripe dans l'en-tete
 * `Stripe-Signature` et verifiee ici contre STRIPE_WEBHOOK_SECRET. Sans cette
 * verification, n'importe qui pourrait forger un evenement de paiement reussi.
 *
 * Les deux secrets sont exiges au demarrage plutot qu'a l'appel : un defaut de
 * configuration doit faire echouer le boot, pas passer inapercu jusqu'au
 * premier paiement.
 */
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

  /**
   * Verifie la signature de l'evenement puis l'oriente selon son type.
   *
   * Le payload doit etre le corps brut de la requete, pas l'objet JSON parse :
   * la signature porte sur les octets exacts recus, donc toute reserialisation
   * la casserait. C'est la raison du `rawBody: true` dans main.ts.
   *
   * Etat actuel : les trois types d'evenements attendus sont reconnus et
   * journalises, mais aucun effet metier n'est encore branche. La creation de
   * la facture et le passage de la reservation a `confirmed` restent a faire.
   *
   * @param payload corps brut de la requete HTTP
   * @param signature en-tete `Stripe-Signature`
   * @throws BadRequestException si la signature ne correspond pas
   */
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
