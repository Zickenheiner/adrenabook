import { ApiProperty } from '@nestjs/swagger';

export type HealthStatus = 'ok' | 'degraded' | 'down';
export type DependencyStatus = 'ok' | 'fail';

export class HealthChecksDto {
  @ApiProperty({
    description: 'MongoDB connection status',
    example: 'ok',
    enum: ['ok', 'fail'],
  })
  mongodb: DependencyStatus;

  @ApiProperty({
    description: 'RabbitMQ broker status',
    example: 'ok',
    enum: ['ok', 'fail'],
  })
  rabbitmq: DependencyStatus;

  @ApiProperty({
    description: 'Stripe payment provider status',
    example: 'ok',
    enum: ['ok', 'fail'],
  })
  stripe: DependencyStatus;

  @ApiProperty({
    description: 'SendGrid email provider status',
    example: 'ok',
    enum: ['ok', 'fail'],
  })
  sendgrid: DependencyStatus;
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
