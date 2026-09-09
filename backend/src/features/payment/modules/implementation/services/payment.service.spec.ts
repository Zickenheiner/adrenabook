import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';

// Le SDK Stripe est remplace par un constructeur factice : constructEvent est
// delegue a une fonction declaree plus bas, car la fabrique jest.mock est
// hoistee au-dessus des declarations du fichier.
jest.mock('stripe', () =>
  jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: (payload: Buffer, signature: string, secret: string) =>
        constructEventMock(payload, signature, secret),
    },
  })),
);

const constructEventMock = jest.fn();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const StripeMock = require('stripe') as jest.Mock;

describe('PaymentService', () => {
  let service: PaymentService;

  const buildModule = async (
    config: Record<string, string | undefined> = {
      STRIPE_SECRET_KEY: 'sk_test',
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
    },
  ): Promise<TestingModule> =>
    Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string) => config[key]) },
        },
      ],
    }).compile();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await buildModule();
    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should instantiate the Stripe client with the configured secret key', () => {
      expect(StripeMock).toHaveBeenCalledWith('sk_test', {
        apiVersion: '2026-04-22.dahlia',
      });
    });

    it('should throw when STRIPE_SECRET_KEY is missing', async () => {
      await expect(
        buildModule({ STRIPE_WEBHOOK_SECRET: 'whsec_test' }),
      ).rejects.toThrow('STRIPE_SECRET_KEY is not configured');
    });

    it('should throw when STRIPE_WEBHOOK_SECRET is missing', async () => {
      await expect(
        buildModule({ STRIPE_SECRET_KEY: 'sk_test' }),
      ).rejects.toThrow('STRIPE_WEBHOOK_SECRET is not configured');
    });
  });

  describe('handleStripeWebhook()', () => {
    const payload = Buffer.from('{"id":"evt_1"}');

    it('should verify the signature against the configured webhook secret', async () => {
      constructEventMock.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_1' } },
      });

      await service.handleStripeWebhook(payload, 'sig_1');

      expect(constructEventMock).toHaveBeenCalledWith(
        payload,
        'sig_1',
        'whsec_test',
      );
    });

    it('should throw BadRequestException when the signature is invalid', async () => {
      constructEventMock.mockImplementation(() => {
        throw new Error('No signatures found matching the expected signature');
      });

      await expect(
        service.handleStripeWebhook(payload, 'bad_sig'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should log a succeeded payment intent', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      constructEventMock.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_1' } },
      });

      await service.handleStripeWebhook(payload, 'sig_1');

      expect(logSpy).toHaveBeenCalledWith('PaymentIntent succeeded: pi_1');
      logSpy.mockRestore();
    });

    it('should warn on a failed payment intent', async () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      constructEventMock.mockReturnValue({
        type: 'payment_intent.payment_failed',
        data: { object: { id: 'pi_2' } },
      });

      await service.handleStripeWebhook(payload, 'sig_1');

      expect(warnSpy).toHaveBeenCalledWith('PaymentIntent failed: pi_2');
      warnSpy.mockRestore();
    });

    it('should log a refunded charge', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      constructEventMock.mockReturnValue({
        type: 'charge.refunded',
        data: { object: { id: 'ch_1' } },
      });

      await service.handleStripeWebhook(payload, 'sig_1');

      expect(logSpy).toHaveBeenCalledWith('Charge refunded: ch_1');
      logSpy.mockRestore();
    });

    it('should silently ignore an unhandled event type', async () => {
      const debugSpy = jest
        .spyOn(Logger.prototype, 'debug')
        .mockImplementation();
      constructEventMock.mockReturnValue({
        type: 'customer.created',
        data: { object: { id: 'cus_1' } },
      });

      await expect(
        service.handleStripeWebhook(payload, 'sig_1'),
      ).resolves.toBeUndefined();
      expect(debugSpy).toHaveBeenCalledWith(
        'Unhandled Stripe event type: customer.created',
      );
      debugSpy.mockRestore();
    });
  });
});
