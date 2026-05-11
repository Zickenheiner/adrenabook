import type { CreateSlotsResultEntity } from '../entities/slot.entity';
import type { CreateSlotRequestDto } from '../../data/dtos/slot.dto';

export interface SlotRepository {
  createSlots(
    activityId: string,
    data: CreateSlotRequestDto,
  ): Promise<CreateSlotsResultEntity>;
}
