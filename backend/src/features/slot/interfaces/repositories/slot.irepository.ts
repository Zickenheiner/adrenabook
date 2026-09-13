import { CreateSlotsDto } from '@features/slot/domains/dtos/slot.dto';
import { Prerequisites } from '@features/activity/domains/schemas/activity.schema';
import { SlotEntity } from '@features/slot/domains/entities/slot.entity';

/**
 * Proprietaire d'une activite : Activity -> ProfessionalCenter.ownerId.
 * ownerId est null si l'activite existe mais que son centre est introuvable.
 */
export interface ActivityOwnership {
  ownerId: string | null;
}

/**
 * Conditions portees par l'activite, dont un creneau herite : duree, prix et
 * prerequis de participation. Le creneau ne les stocke pas, il les lit ici au
 * moment de construire une reponse.
 */
export interface ActivityConditions {
  durationMinutes: number;
  priceEur: number;
  prerequisites?: Prerequisites;
}

export interface ISlotRepository {
  findById(id: string): Promise<SlotEntity | null>;
  countActiveBookings(slotId: string): Promise<number>;
  findByActivityId(activityId: string): Promise<SlotEntity[] | null>;
  /** @param month mois vise au format YYYY-MM */
  findByActivityIdAndMonth(
    activityId: string,
    month: string,
  ): Promise<SlotEntity[]>;
  /** Mois comportant au moins un creneau, format YYYY-MM, ordre croissant. */
  findMonthsWithSlots(activityId: string): Promise<string[]>;
  /** null si l'activite n'existe pas */
  findActivityOwnership(activityId: string): Promise<ActivityOwnership | null>;
  /** null si l'activite n'existe pas */
  findActivityConditions(
    activityId: string,
  ): Promise<ActivityConditions | null>;
  createMany(
    activityId: string,
    dto: CreateSlotsDto,
    startDates: Date[],
  ): Promise<SlotEntity[]>;
}
