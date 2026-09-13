import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  CreateSlotRequestDto,
  CreateSlotsResponseDto,
  ProSlotMonthResponseDto,
  UpdateSlotRequestDto,
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
  async updateSlot(
    activityId: string,
    slotId: string,
    data: UpdateSlotRequestDto,
  ): Promise<boolean> {
    return request<boolean>({
      url: endpoints.proSlots.byId(activityId, slotId),
      method: methods.PATCH,
      data,
    });
  }

  async deleteSlot(activityId: string, slotId: string): Promise<boolean> {
    return request<boolean>({
      url: endpoints.proSlots.byId(activityId, slotId),
      method: methods.DELETE,
    });
  }
}

export default SlotApi;
