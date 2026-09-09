import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import * as request from 'supertest';
import { HealthController } from './health.controller';
import { HealthService } from '../implementation/services/health.service';

describe('Health (integration)', () => {
  let app: INestApplication;

  const buildApp = async (
    mongoReadyState: number,
    configValues: Record<string, string | undefined>,
  ): Promise<INestApplication> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: 'IHealthService',
          useClass: HealthService,
        },
        {
          provide: getConnectionToken(),
          useValue: { readyState: mongoReadyState },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => configValues[key]),
          },
        },
      ],
    }).compile();

    const application = moduleFixture.createNestApplication();
    application.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await application.init();
    return application;
  };

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should respond with 200 and status "ok" when everything is healthy', async () => {
    app = await buildApp(1, {
      APP_VERSION: '2.0.0',
      STRIPE_SECRET_KEY: 'sk_test',
      SENDGRID_API_KEY: 'sg_key',
    });

    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.version).toBe('2.0.0');
    expect(response.body.checks.mongodb).toBe('ok');
    expect(response.body.checks).not.toHaveProperty('rabbitmq');
  });

  it('should respond with 503 and status "down" when MongoDB is disconnected', async () => {
    app = await buildApp(0, {
      APP_VERSION: '2.0.0',
      STRIPE_SECRET_KEY: 'sk_test',
      SENDGRID_API_KEY: 'sg_key',
    });

    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('down');
    expect(response.body.checks.mongodb).toBe('fail');
  });

  it('should respond with 200 and status "degraded" when a provider is not configured', async () => {
    app = await buildApp(1, {
      APP_VERSION: '2.0.0',
      STRIPE_SECRET_KEY: 'sk_test',
      SENDGRID_API_KEY: undefined,
    });

    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('degraded');
    expect(response.body.checks.sendgrid).toBe('not_configured');
  });
});
