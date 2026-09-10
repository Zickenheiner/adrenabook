import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import METHODS from '@/core/constants/methods';
import type {
  SearchActivitiesQueryDto,
  SearchActivitiesResponseDto,
} from '../dtos/activity-search.dto';

class ActivitySearchApi {
  constructor(
    private readonly baseUrl: string = endpoints.activitySearch.search,
  ) {}

  async search(
    params: SearchActivitiesQueryDto,
  ): Promise<SearchActivitiesResponseDto> {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => [k, String(v)]),
    ).toString();

    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    return request<SearchActivitiesResponseDto>({
      url,
      method: METHODS.GET,
    });
  }
}

export default ActivitySearchApi;
