import type { DashboardEntity } from '../entities/dashboard.entity';

export interface DashboardRepository {
  getDashboard(): Promise<DashboardEntity>;
}
