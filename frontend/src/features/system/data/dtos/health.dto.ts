export type HealthStatus = 'ok' | 'degraded' | 'down';

export type HealthCheckState = 'ok' | 'fail';

export interface HealthChecksDto {
  mongodb: HealthCheckState;
  rabbitmq: HealthCheckState;
  stripe: HealthCheckState;
  sendgrid: HealthCheckState;
}

export interface HealthCheckResponseDto {
  status: HealthStatus;
  version: string;
  uptime: number;
  checks: HealthChecksDto;
  responseTimeMs: number;
}
