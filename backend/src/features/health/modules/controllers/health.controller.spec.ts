import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { HealthController } from './health.controller';
import { IHealthService } from '@features/health/interfaces/services/health.iservice';
import { HealthCheckResponseDto } from '@features/health/domains/dtos/health.dto';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: jest.Mocked<IHealthService>;

  const buildResponseMock = (): Response => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const healthServiceMock: jest.Mocked<IHealthService> = {
      check: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: 'IHealthService',
          useValue: healthServiceMock,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get('IHealthService');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check()', () => {
    it('should return the service result when status is "ok" without changing HTTP status', async () => {
      const expected: HealthCheckResponseDto = {
        status: 'ok',
        version: '1.0.0',
        uptime: 100,
        responseTimeMs: 5,
        checks: {
          mongodb: 'ok',
          rabbitmq: 'ok',
          stripe: 'ok',
          sendgrid: 'ok',
        },
      };
      healthService.check.mockResolvedValue(expected);
      const res = buildResponseMock();

      const result = await controller.check(res);

      expect(result).toEqual(expected);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should set HTTP 503 when status is "degraded"', async () => {
      const expected: HealthCheckResponseDto = {
        status: 'degraded',
        version: '1.0.0',
        uptime: 100,
        responseTimeMs: 5,
        checks: {
          mongodb: 'ok',
          rabbitmq: 'fail',
          stripe: 'ok',
          sendgrid: 'ok',
        },
      };
      healthService.check.mockResolvedValue(expected);
      const res = buildResponseMock();

      const result = await controller.check(res);

      expect(result).toEqual(expected);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it('should set HTTP 503 when status is "down"', async () => {
      const expected: HealthCheckResponseDto = {
        status: 'down',
        version: '1.0.0',
        uptime: 100,
        responseTimeMs: 5,
        checks: {
          mongodb: 'fail',
          rabbitmq: 'fail',
          stripe: 'fail',
          sendgrid: 'fail',
        },
      };
      healthService.check.mockResolvedValue(expected);
      const res = buildResponseMock();

      const result = await controller.check(res);

      expect(result).toEqual(expected);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it('should propagate errors thrown by the service', async () => {
      healthService.check.mockRejectedValue(new Error('boom'));
      const res = buildResponseMock();

      await expect(controller.check(res)).rejects.toThrow('boom');
    });
  });
});
