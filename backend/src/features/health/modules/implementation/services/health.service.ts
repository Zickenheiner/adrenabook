import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { IHealthService } from '@features/health/interfaces/services/health.iservice';
import {
  ConfigurationStatus,
  ConnectivityStatus,
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
      stripe: this.checkStripeConfiguration(),
      sendgrid: this.checkSendGridConfiguration(),
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

  private checkMongoDb(): ConnectivityStatus {
    // readyState 1 === connected
    return this.mongooseConnection?.readyState === 1 ? 'ok' : 'fail';
  }

  /**
   * Verifie uniquement la presence de la cle Stripe : aucun appel reseau
   * n'est effectue vers l'API Stripe, d'ou l'etat "configured".
   */
  private checkStripeConfiguration(): ConfigurationStatus {
    return this.isConfigured('STRIPE_SECRET_KEY');
  }

  /**
   * Verifie uniquement la presence de la cle SendGrid : aucun appel reseau
   * n'est effectue vers l'API SendGrid, d'ou l'etat "configured".
   */
  private checkSendGridConfiguration(): ConfigurationStatus {
    return this.isConfigured('SENDGRID_API_KEY');
  }

  private isConfigured(key: string): ConfigurationStatus {
    const value = this.configService.get<string>(key);
    return value && value.trim().length > 0 ? 'configured' : 'not_configured';
  }

  private computeOverallStatus(checks: HealthChecksDto): HealthStatus {
    // Si MongoDB est down, le service est totalement down.
    if (checks.mongodb === 'fail') {
      return 'down';
    }

    const misconfigured = Object.values(checks).filter(
      (value) => value === 'not_configured',
    ).length;

    return misconfigured === 0 ? 'ok' : 'degraded';
  }
}
