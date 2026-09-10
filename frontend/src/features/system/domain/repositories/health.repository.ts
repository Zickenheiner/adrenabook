import type { HealthEntity } from '../entities/health.entity';

export interface HealthRepository {
  getHealth(): Promise<HealthEntity>;
}
