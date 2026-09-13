import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  CreateSlotRequestDto,
  CreateSlotsResponseDto,
  ProSlotMonthResponseDto,
} from '../dtos/slot.dto';

class SlotApi {
  async listSlots(
    activityId: string,
    month: string,
  ): Promise<ProSlotMonthResponseDto> {
    return request<ProSlotMonthResponseDto>({
      url: endpoints.proSlots.list(activityId, month),
      method: methods.GET,
    });
  }

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
