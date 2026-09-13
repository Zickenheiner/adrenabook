import type { ActivityDetailRepository } from '../../domain/repositories/activity-detail.repository';
import type {
  ActivityDetailEntity,
  ActivityMonthSlotsEntity,
} from '../../domain/entities/activity-detail.entity';
import ActivityDetailApi from '../datasources/activity-detail.api';
import ActivityDetailMapper from '../mappers/activity-detail.mapper';

class ActivityDetailRepositoryImpl implements ActivityDetailRepository {
  constructor(
    private readonly api: ActivityDetailApi = new ActivityDetailApi(),
    private readonly mapper: ActivityDetailMapper = new ActivityDetailMapper(),
  ) {}

  async getById(id: string): Promise<ActivityDetailEntity> {
    const dto = await this.api.getById(id);
    return this.mapper.toEntity(dto);
  }

  async getSlotsByMonth(
    id: string,
    month: string,
  ): Promise<ActivityMonthSlotsEntity> {
    const dto = await this.api.getSlotsByMonth(id, month);
    return {
      slots: dto.slots.map((slot) => ({
        ...slot,
        startAt: new Date(slot.startAt),
      })),
      availableMonths: dto.availableMonths,
    };
  }
}

export default ActivityDetailRepositoryImpl;
