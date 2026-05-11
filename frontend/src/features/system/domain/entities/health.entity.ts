export type HealthStatus = 'ok' | 'degraded' | 'down';

export type HealthCheckState = 'ok' | 'fail';

export interface HealthChecksEntity {
  mongodb: HealthCheckState;
  rabbitmq: HealthCheckState;
  stripe: HealthCheckState;
  sendgrid: HealthCheckState;
}

export interface HealthEntity {
  status: HealthStatus;
  version: string;
  uptime: number;
  checks: HealthChecksEntity;
  responseTimeMs: number;
  checkedAt: Date;
}
