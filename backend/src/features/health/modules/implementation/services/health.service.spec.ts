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
      STRIPE_SECRET_KEY: 'sk_test',
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
    it('should return status "ok" when MongoDB is up and every provider is configured', async () => {
      const result = await service.check();

      expect(result.status).toBe('ok');
      expect(result.version).toBe('1.2.3');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.checks).toEqual({
        mongodb: 'ok',
        stripe: 'configured',
        sendgrid: 'configured',
      });
    });

    it('should not expose any rabbitmq check', async () => {
      const result = await service.check();

      expect(result.checks).not.toHaveProperty('rabbitmq');
    });

    it('should return default version "0.0.0" if APP_VERSION is not set', async () => {
      const module = await buildModule(
        { readyState: 1 },
        {
          APP_VERSION: undefined,
          STRIPE_SECRET_KEY: 'sk_test',
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

    it('should report Stripe as "not_configured" when STRIPE_SECRET_KEY is missing', async () => {
      const module = await buildModule(
        { readyState: 1 },
        {
          APP_VERSION: '1.0.0',
          STRIPE_SECRET_KEY: undefined,
          SENDGRID_API_KEY: 'sg_key',
        },
      );
      service = module.get<HealthService>(HealthService);

      const result = await service.check();

      expect(result.status).toBe('degraded');
      expect(result.checks.stripe).toBe('not_configured');
      expect(result.checks.mongodb).toBe('ok');
    });

    it('should not read the legacy STRIPE_API_KEY variable', async () => {
      const module = await buildModule(
        { readyState: 1 },
        {
          APP_VERSION: '1.0.0',
          STRIPE_API_KEY: 'sk_legacy',
          SENDGRID_API_KEY: 'sg_key',
        },
      );
      service = module.get<HealthService>(HealthService);

      const result = await service.check();

      expect(result.checks.stripe).toBe('not_configured');
    });

    it('should report Stripe as "not_configured" when STRIPE_SECRET_KEY is blank', async () => {
      const module = await buildModule(
        { readyState: 1 },
        {
          APP_VERSION: '1.0.0',
          STRIPE_SECRET_KEY: '   ',
          SENDGRID_API_KEY: 'sg_key',
        },
      );
      service = module.get<HealthService>(HealthService);

      const result = await service.check();

      expect(result.checks.stripe).toBe('not_configured');
    });

    it('should report SendGrid as "not_configured" when SENDGRID_API_KEY is missing', async () => {
      const module = await buildModule(
        { readyState: 1 },
        {
          APP_VERSION: '1.0.0',
          STRIPE_SECRET_KEY: 'sk_test',
          SENDGRID_API_KEY: undefined,
        },
      );
      service = module.get<HealthService>(HealthService);

      const result = await service.check();

      expect(result.status).toBe('degraded');
      expect(result.checks.sendgrid).toBe('not_configured');
    });

    it('should report status "down" when MongoDB is down even if providers are misconfigured', async () => {
      const module = await buildModule(
        { readyState: 0 },
        {
          APP_VERSION: '1.0.0',
          STRIPE_SECRET_KEY: undefined,
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
