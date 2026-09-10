import type {
  ActivitySearchResultEntity,
  ActivitySearchParamsEntity,
} from '../entities/activity-search.entity';

export interface ActivitySearchRepository {
  search(
    params: ActivitySearchParamsEntity,
  ): Promise<ActivitySearchResultEntity>;
}
