import {
  CreateSlotsDto,
  CreateSlotsResponseDto,
  ProSlotMonthResponseDto,
  SlotDetailResponseDto,
} from '@features/slot/domains/dtos/slot.dto';

export interface ISlotService {
  findDetailById(id: string): Promise<SlotDetailResponseDto | null>;
  findByActivityIdForOwner(
    activityId: string,
    userId: string,
    month: string,
  ): Promise<ProSlotMonthResponseDto>;
  createSlots(
    activityId: string,
    userId: string,
    dto: CreateSlotsDto,
  ): Promise<CreateSlotsResponseDto>;
}
