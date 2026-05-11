import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getConnectionToken } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from '@core/guards/access-token.guard';
import { AtStrategy } from '@core/strategies/at.strategy';
import { HealthController } from '@features/health/modules/controllers/health.controller';
import { HealthService } from '@features/health/modules/implementation/services/health.service';

describe('Health (e2e)', () => {
  let app: INestApplication;

  const mongooseConnectionMock = {
    readyState: 1,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              ACCESS_TOKEN_SECRET: 'e2e-secret',
              APP_VERSION: '1.0.0-e2e',
              RABBITMQ_URL: 'amqp://localhost',
              STRIPE_API_KEY: 'sk_test_e2e',
              SENDGRID_API_KEY: 'sg_e2e',
            }),
          ],
        }),
      ],
      controllers: [HealthController],
      providers: [
        ConfigService,
        AtStrategy,
        {
          provide: APP_GUARD,
          useClass: AccessTokenGuard,
        },
        {
          provide: 'IHealthService',
          useClass: HealthService,
        },
        {
          provide: getConnectionToken(),
          useValue: mongooseConnectionMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health should return 200 with status ok when all dependencies are up', async () => {
    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        version: '1.0.0-e2e',
        uptime: expect.any(Number),
        responseTimeMs: expect.any(Number),
        checks: expect.objectContaining({
          mongodb: 'ok',
          rabbitmq: 'ok',
          stripe: 'ok',
          sendgrid: 'ok',
        }),
      }),
    );
  });

  it('GET /health should not require authentication (public endpoint)', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.status).not.toBe(401);
  });
});
