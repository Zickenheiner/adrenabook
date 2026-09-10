import type { ActivityDetailEntity } from '../entities/activity-detail.entity';

export interface ActivityDetailRepository {
  getById(id: string): Promise<ActivityDetailEntity>;
}
