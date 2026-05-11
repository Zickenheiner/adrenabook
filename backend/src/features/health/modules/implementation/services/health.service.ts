import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { IHealthService } from '@features/health/interfaces/services/health.iservice';
import {
  DependencyStatus,
  HealthChecksDto,
  HealthCheckResponseDto,
  HealthStatus,
} from '@features/health/domains/dtos/health.dto';

@Injectable()
export class HealthService implements IHealthService {
  constructor(
    @InjectConnection()
    private readonly mongooseConnection: Connection,
    private readonly configService: ConfigService,
  ) {}

  async check(): Promise<HealthCheckResponseDto> {
    const startedAt = Date.now();

    const checks: HealthChecksDto = {
      mongodb: this.checkMongoDb(),
      rabbitmq: this.checkRabbitMq(),
      stripe: this.checkStripe(),
      sendgrid: this.checkSendGrid(),
    };

    const status = this.computeOverallStatus(checks);

    return {
      status,
      version: this.configService.get<string>('APP_VERSION') ?? '0.0.0',
      uptime: Math.floor(process.uptime()),
      checks,
      responseTimeMs: Date.now() - startedAt,
    };
  }

  private checkMongoDb(): DependencyStatus {
    // readyState 1 === connected
    return this.mongooseConnection?.readyState === 1 ? 'ok' : 'fail';
  }

  private checkRabbitMq(): DependencyStatus {
    // Pas de driver RabbitMQ branche actuellement : on considere "ok"
    // si une URL est configuree, sinon "fail".
    return this.configService.get<string>('RABBITMQ_URL') ? 'ok' : 'fail';
  }

  private checkStripe(): DependencyStatus {
    return this.configService.get<string>('STRIPE_API_KEY') ? 'ok' : 'fail';
  }

  private checkSendGrid(): DependencyStatus {
    return this.configService.get<string>('SENDGRID_API_KEY') ? 'ok' : 'fail';
  }

  private computeOverallStatus(checks: HealthChecksDto): HealthStatus {
    const values = Object.values(checks);
    const failures = values.filter((value) => value === 'fail').length;

    if (failures === 0) {
      return 'ok';
    }

    // Si MongoDB est down, le service est totalement down.
    if (checks.mongodb === 'fail') {
      return 'down';
    }

    return 'degraded';
  }
}
