import type {
  ActivityDetailEntity,
  ActivityMonthSlotsEntity,
} from '../entities/activity-detail.entity';

export interface ActivityDetailRepository {
  getById(id: string): Promise<ActivityDetailEntity>;
  /** @param month mois vise au format YYYY-MM */
  getSlotsByMonth(id: string, month: string): Promise<ActivityMonthSlotsEntity>;
}
