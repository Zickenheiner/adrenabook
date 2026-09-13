import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  ActivityDetailResponseDto,
  ActivityMonthSlotsResponseDto,
} from '../dtos/activity-detail.dto';

class ActivityDetailApi {
  async getById(id: string): Promise<ActivityDetailResponseDto> {
    return request<ActivityDetailResponseDto>({
      url: endpoints.activityDetail.byId(id),
      method: methods.GET,
    });
  }

  async getSlotsByMonth(
    id: string,
    month: string,
  ): Promise<ActivityMonthSlotsResponseDto> {
    return request<ActivityMonthSlotsResponseDto>({
      url: endpoints.activityDetail.slotsByMonth(id, month),
      method: methods.GET,
    });
  }
}

export default ActivityDetailApi;
