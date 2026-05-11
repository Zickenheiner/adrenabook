import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let mongooseConnection: { readyState: number };
  let configValues: Record<string, string | undefined>;

  const buildModule = async (
    connectionOverride?: { readyState: number },
    configOverride?: Record<string, string | undefined>,
  ): Promise<TestingModule> => {
    mongooseConnection = connectionOverride ?? { readyState: 1 };
    configValues = configOverride ?? {
      APP_VERSION: '1.2.3',
      RABBITMQ_URL: 'amqp://localhost',
      STRIPE_API_KEY: 'sk_test',
      SENDGRID_API_KEY: 'sg_key',
    };

    return Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: getConnectionToken(),
          useValue: mongooseConnection,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => configValues[key]),
          },
        },
      ],
    }).compile();
  };

  beforeEach(async () => {
    const module = await buildModule();
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check()', () => {
    it('should return status "ok" when all dependencies are healthy', async () => {
      const result = await service.check();

      expect(result.status).toBe('ok');
      expect(result.version).toBe('1.2.3');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.checks).toEqual({
        mongodb: 'ok',
        rabbitmq: 'ok',
        stripe: 'ok',
        sendgrid: 'ok',
      });
    });

    it('should return default version "0.0.0" if APP_VERSION is not set', async () => {
      const module = await buildModule(
        { readyState: 1 },
        {
          APP_VERSION: undefined,
          RABBITMQ_URL: 'amqp://localhost',
          STRIPE_API_KEY: 'sk_test',
          SENDGRID_API_KEY: 'sg_key',
        },
      );
      service = module.get<HealthService>(HealthService);

      const result = await service.check();
      expect(result.version).toBe('0.0.0');
    });

    it('should return status "down" if MongoDB is disconnected', async () => {
      const module = await buildModule({ readyState: 0 });
      service = module.get<HealthService>(HealthService);

      const result = await service.check();

      expect(result.status).toBe('down');
      expect(result.checks.mongodb).toBe('fail');
    });

    it('should return status "degraded" if a non-critical dependency fails', async () => {
      const module = await buildModule(
        { readyState: 1 },
        {
          APP_VERSION: '1.0.0',
          RABBITMQ_URL: undefined,
          STRIPE_API_KEY: 'sk_test',
          SENDGRID_API_KEY: 'sg_key',
        },
      );
      service = module.get<HealthService>(HealthService);

      const result = await service.check();

      expect(result.status).toBe('degraded');
      expect(result.checks.rabbitmq).toBe('fail');
      expect(result.checks.mongodb).toBe('ok');
    });

    it('should report Stripe as failing when STRIPE_API_KEY is missing', async () => {
      const module = await buildModule(
        { readyState: 1 },
        {
          APP_VERSION: '1.0.0',
          RABBITMQ_URL: 'amqp://localhost',
          STRIPE_API_KEY: undefined,
          SENDGRID_API_KEY: 'sg_key',
        },
      );
      service = module.get<HealthService>(HealthService);

      const result = await service.check();

      expect(result.status).toBe('degraded');
      expect(result.checks.stripe).toBe('fail');
    });

    it('should report SendGrid as failing when SENDGRID_API_KEY is missing', async () => {
      const module = await buildModule(
        { readyState: 1 },
        {
          APP_VERSION: '1.0.0',
          RABBITMQ_URL: 'amqp://localhost',
          STRIPE_API_KEY: 'sk_test',
          SENDGRID_API_KEY: undefined,
        },
      );
      service = module.get<HealthService>(HealthService);

      const result = await service.check();

      expect(result.status).toBe('degraded');
      expect(result.checks.sendgrid).toBe('fail');
    });

    it('should report status "down" when MongoDB is down even if other services fail', async () => {
      const module = await buildModule(
        { readyState: 0 },
        {
          APP_VERSION: '1.0.0',
          RABBITMQ_URL: undefined,
          STRIPE_API_KEY: undefined,
          SENDGRID_API_KEY: undefined,
        },
      );
      service = module.get<HealthService>(HealthService);

      const result = await service.check();

      expect(result.status).toBe('down');
    });

    it('should handle a null mongoose connection gracefully', async () => {
      const module = await Test.createTestingModule({
        providers: [
          HealthService,
          {
            provide: getConnectionToken(),
            useValue: null,
          },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => 'value'),
            },
          },
        ],
      }).compile();
      service = module.get<HealthService>(HealthService);

      const result = await service.check();

      expect(result.checks.mongodb).toBe('fail');
      expect(result.status).toBe('down');
    });
  });
});
