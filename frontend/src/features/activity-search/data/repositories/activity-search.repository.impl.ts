import type { ActivitySearchRepository } from '../../domain/repositories/activity-search.repository';
import type {
  ActivitySearchResultEntity,
  ActivitySearchParamsEntity,
} from '../../domain/entities/activity-search.entity';
import ActivitySearchApi from '../datasources/activity-search.api';
import ActivitySearchMapper from '../mappers/activity-search.mapper';

class ActivitySearchRepositoryImpl implements ActivitySearchRepository {
  constructor(
    private readonly api: ActivitySearchApi = new ActivitySearchApi(),
    private readonly mapper: ActivitySearchMapper = new ActivitySearchMapper(),
  ) {}

  async search(
    params: ActivitySearchParamsEntity,
  ): Promise<ActivitySearchResultEntity> {
    const dto = await this.api.search(params);
    return this.mapper.toEntity(dto);
  }
}

export default ActivitySearchRepositoryImpl;
