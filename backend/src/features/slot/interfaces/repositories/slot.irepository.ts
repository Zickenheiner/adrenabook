import { CreateSlotsDto } from '@features/slot/domains/dtos/slot.dto';
import { SlotEntity } from '@features/slot/domains/entities/slot.entity';

export interface ISlotRepository {
  findByActivityId(activityId: string): Promise<SlotEntity[] | null>;
  createMany(
    activityId: string,
    dto: CreateSlotsDto,
    startDates: Date[],
  ): Promise<SlotEntity[]>;
}
