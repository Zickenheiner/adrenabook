import type {
  CreateSlotsResultEntity,
  ProSlotEntity,
} from '../entities/slot.entity';
import type { CreateSlotRequestDto } from '../../data/dtos/slot.dto';

export interface SlotRepository {
  listSlots(activityId: string): Promise<ProSlotEntity[]>;
  createSlots(
    activityId: string,
    data: CreateSlotRequestDto,
  ): Promise<CreateSlotsResultEntity>;
}
