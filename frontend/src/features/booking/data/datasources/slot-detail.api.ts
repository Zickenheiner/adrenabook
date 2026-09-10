import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type { SlotDetailResponseDto } from '../dtos/slot-detail.dto';

class SlotDetailApi {
  async getById(id: string): Promise<SlotDetailResponseDto> {
    return request<SlotDetailResponseDto>({
      url: endpoints.slots.byId(id),
      method: methods.GET,
    });
  }
}

export default SlotDetailApi;
