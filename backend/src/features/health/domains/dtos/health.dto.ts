import { ApiProperty } from '@nestjs/swagger';

export type HealthStatus = 'ok' | 'degraded' | 'down';

/**
 * Etat d'une dependance dont la connectivite est reellement testee.
 */
export type ConnectivityStatus = 'ok' | 'fail';

/**
 * Etat d'une dependance externe dont seule la configuration est verifiee
 * (aucun appel reseau n'est effectue vers le fournisseur).
 */
export type ConfigurationStatus = 'configured' | 'not_configured';

export type DependencyStatus = ConnectivityStatus | ConfigurationStatus;

export const CONNECTIVITY_STATUSES: ConnectivityStatus[] = ['ok', 'fail'];
export const CONFIGURATION_STATUSES: ConfigurationStatus[] = [
  'configured',
  'not_configured',
];

export class HealthChecksDto {
  @ApiProperty({
    description: 'MongoDB connection status (real connectivity check)',
    example: 'ok',
    enum: CONNECTIVITY_STATUSES,
  })
  mongodb: ConnectivityStatus;

  @ApiProperty({
    description:
      'Stripe credentials configuration status. No network call is performed: "configured" only means STRIPE_SECRET_KEY is present.',
    example: 'configured',
    enum: CONFIGURATION_STATUSES,
  })
  stripe: ConfigurationStatus;

  @ApiProperty({
    description:
      'SendGrid credentials configuration status. No network call is performed: "configured" only means SENDGRID_API_KEY is present.',
    example: 'configured',
    enum: CONFIGURATION_STATUSES,
  })
  sendgrid: ConfigurationStatus;
}

export class HealthCheckResponseDto {
  @ApiProperty({
    description: 'Overall health status of the service',
    example: 'ok',
    enum: ['ok', 'degraded', 'down'],
  })
  status: HealthStatus;

  @ApiProperty({
    description: 'Current application version',
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({
    description: 'Process uptime in seconds',
    example: 12345,
  })
  uptime: number;

  @ApiProperty({
    description: 'Status of each external dependency',
    type: HealthChecksDto,
  })
  checks: HealthChecksDto;

  @ApiProperty({
    description: 'Total response time of the health check in milliseconds',
    example: 42,
  })
  responseTimeMs: number;
}
