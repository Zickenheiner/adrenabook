import {
  CreateSlotsDto,
  CreateSlotsResponseDto,
} from '@features/slot/domains/dtos/slot.dto';

export interface ISlotService {
  createSlots(
    activityId: string,
    userId: string,
    dto: CreateSlotsDto,
  ): Promise<CreateSlotsResponseDto>;
}
