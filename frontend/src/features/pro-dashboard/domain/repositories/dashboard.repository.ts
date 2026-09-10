import type { DashboardEntity } from '../entities/dashboard.entity';
import type { DashboardQueryDto } from '../../data/dtos/dashboard.dto';

export interface DashboardRepository {
  get(query: DashboardQueryDto): Promise<DashboardEntity>;
}
