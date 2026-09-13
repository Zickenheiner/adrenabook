import type { CreateSlotsResultEntity } from '../entities/slot.entity';
import type { CreateSlotRequestDto } from '../../data/dtos/slot.dto';

export interface SlotRepository {
  /** @param month mois visé au format YYYY-MM */
  listSlots(activityId: string, month: string): Promise<ProSlotMonthEntity>;
  createSlots(
    activityId: string,
    data: CreateSlotRequestDto,
  ): Promise<CreateSlotsResultEntity>;
}
