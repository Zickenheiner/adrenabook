import type { ActivityDetailRepository } from '../../domain/repositories/activity-detail.repository';
import type { ActivityDetailEntity } from '../../domain/entities/activity-detail.entity';
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
}

export default ActivityDetailRepositoryImpl;
