import { HealthCheckResponseDto } from '@features/health/domains/dtos/health.dto';

export interface IHealthService {
  check(): Promise<HealthCheckResponseDto>;
}
