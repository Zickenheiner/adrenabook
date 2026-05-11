import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  CreateSlotRequestDto,
  CreateSlotsResponseDto,
} from '../dtos/slot.dto';

class SlotApi {
  async createSlots(
    activityId: string,
    data: CreateSlotRequestDto,
  ): Promise<CreateSlotsResponseDto> {
    return request<CreateSlotsResponseDto>({
      url: endpoints.proSlots.create(activityId),
      method: methods.POST,
      data,
    });
  }
}

export default SlotApi;
