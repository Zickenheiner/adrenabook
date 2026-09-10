import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type { ActivityDetailResponseDto } from '../dtos/activity-detail.dto';

class ActivityDetailApi {
  async getById(id: string): Promise<ActivityDetailResponseDto> {
    return request<ActivityDetailResponseDto>({
      url: endpoints.activityDetail.byId(id),
      method: methods.GET,
    });
  }
}

export default ActivityDetailApi;
