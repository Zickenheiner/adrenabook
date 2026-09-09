import {
  CreateSlotsDto,
  CreateSlotsResponseDto,
  ProSlotListItemDto,
  SlotDetailResponseDto,
} from '@features/slot/domains/dtos/slot.dto';

export interface ISlotService {
  findDetailById(id: string): Promise<SlotDetailResponseDto | null>;
  findByActivityIdForOwner(
    activityId: string,
    userId: string,
  ): Promise<ProSlotListItemDto[]>;
  createSlots(
    activityId: string,
    userId: string,
    dto: CreateSlotsDto,
  ): Promise<CreateSlotsResponseDto>;
}
