import type { UpdateSlotRequestDto } from '../../data/dtos/slot.dto';
import type {
  CreateSlotsResultEntity,
  ProSlotMonthEntity,
} from '../entities/slot.entity';
import type { CreateSlotRequestDto } from '../../data/dtos/slot.dto';

export interface SlotRepository {
  /** @param month mois visé au format YYYY-MM */
  listSlots(activityId: string, month: string): Promise<ProSlotMonthEntity>;
  updateSlot(
    activityId: string,
    slotId: string,
    data: UpdateSlotRequestDto,
  ): Promise<boolean>;
  deleteSlot(activityId: string, slotId: string): Promise<boolean>;
  createSlots(
    activityId: string,
    data: CreateSlotRequestDto,
  ): Promise<CreateSlotsResultEntity>;
}
