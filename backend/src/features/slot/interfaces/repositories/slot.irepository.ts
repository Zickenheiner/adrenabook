import { CreateSlotsDto } from '@features/slot/domains/dtos/slot.dto';
import { SlotEntity } from '@features/slot/domains/entities/slot.entity';

/**
 * Proprietaire d'une activite : Activity -> ProfessionalCenter.ownerId.
 * ownerId est null si l'activite existe mais que son centre est introuvable.
 */
export interface ActivityOwnership {
  ownerId: string | null;
}

export interface ISlotRepository {
  findById(id: string): Promise<SlotEntity | null>;
  countActiveBookings(slotId: string): Promise<number>;
  findByActivityId(activityId: string): Promise<SlotEntity[] | null>;
  /** null si l'activite n'existe pas */
  findActivityOwnership(activityId: string): Promise<ActivityOwnership | null>;
  createMany(
    activityId: string,
    dto: CreateSlotsDto,
    startDates: Date[],
  ): Promise<SlotEntity[]>;
}
