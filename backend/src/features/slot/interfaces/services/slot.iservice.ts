import {
  CreateSlotsDto,
  CreateSlotsResponseDto,
  ProSlotMonthResponseDto,
  UpdateSlotDto,
  SlotDetailResponseDto,
} from '@features/slot/domains/dtos/slot.dto';

export interface ISlotService {
  findDetailById(id: string): Promise<SlotDetailResponseDto | null>;
  findByActivityIdForOwner(
    activityId: string,
    userId: string,
    month: string,
  ): Promise<ProSlotMonthResponseDto>;
  updateSlotForOwner(
    activityId: string,
    slotId: string,
    userId: string,
    changes: UpdateSlotDto,
  ): Promise<boolean>;
  deleteSlotForOwner(
    activityId: string,
    slotId: string,
    userId: string,
  ): Promise<boolean>;
  createSlots(
    activityId: string,
    userId: string,
    dto: CreateSlotsDto,
  ): Promise<CreateSlotsResponseDto>;
}
