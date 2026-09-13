import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ISlotService } from '../../../interfaces/services/slot.iservice';
import {
  ActivityConditions,
  ISlotRepository,
} from '@features/slot/interfaces/repositories/slot.irepository';
import {
  CreateSlotsDto,
  CreateSlotsResponseDto,
  ProSlotListItemDto,
  ProSlotMonthResponseDto,
  RecurrenceDto,
  SlotConflictDto,
  SlotDetailResponseDto,
  SlotItemDto,
} from '@features/slot/domains/dtos/slot.dto';
import { SlotEntity } from '@features/slot/domains/entities/slot.entity';
import { RRule } from 'rrule';

@Injectable()
export class SlotService implements ISlotService {
  constructor(
    @Inject('ISlotRepository')
    private readonly slotRepository: ISlotRepository,
  ) {}

  async findDetailById(id: string): Promise<SlotDetailResponseDto | null> {
    const slot = await this.slotRepository.findById(id);
    if (!slot) return null;

    const conditions = await this.slotRepository.findActivityConditions(
      slot.getActivityId().toString(),
    );
    if (!conditions) {
      throw new NotFoundException('Activité introuvable');
    }

    return this.buildSlotDetail(slot, conditions);
  }

  /**
   * Creneaux d'un mois pour le professionnel proprietaire, et mois comportant
   * des creneaux.
   *
   * Charger un mois a la fois evite d'afficher une annee de creneaux d'un seul
   * tenant ; `availableMonths` situe les mois occupes pour ne pas naviguer a
   * l'aveugle.
   *
   * @param month mois vise au format YYYY-MM
   */
  async findByActivityIdForOwner(
    activityId: string,
    userId: string,
    month: string,
  ): Promise<ProSlotMonthResponseDto> {
    const ownership =
      await this.slotRepository.findActivityOwnership(activityId);
    if (!ownership) {
      throw new NotFoundException('Activité introuvable');
    }
    if (ownership.ownerId !== userId) {
      throw new ForbiddenException(
        'Cette activité appartient à un autre professionnel',
      );
    }

    // Tous ces creneaux partagent la meme activite : un seul chargement suffit.
    const conditions =
      await this.slotRepository.findActivityConditions(activityId);
    if (!conditions) {
      throw new NotFoundException('Activité introuvable');
    }

    const [slots, availableMonths] = await Promise.all([
      this.slotRepository.findByActivityIdAndMonth(activityId, month),
      this.slotRepository.findMonthsWithSlots(activityId),
    ]);

    const details = await Promise.all(
      slots.map((slot) => this.buildSlotDetail(slot, conditions)),
    );

    return {
      // activityId est volontairement omis : il est deja porte par l'URL
      slots: details.map((detail) => ({
        id: detail.id,
        startAt: detail.startAt,
        durationMinutes: detail.durationMinutes,
        maxParticipants: detail.maxParticipants,
        remainingSeats: detail.remainingSeats,
        priceEur: detail.priceEur,
      })),
      availableMonths,
    };
  }

  /** Source unique du calcul de remainingSeats, partagee par GET /slots/:id */
  private async buildSlotDetail(
    slot: SlotEntity,
    conditions: ActivityConditions,
  ): Promise<SlotDetailResponseDto> {
    const activeBookings = await this.slotRepository.countActiveBookings(
      slot.getId(),
    );
    const maxParticipants = slot.getMaxParticipants();

    return {
      id: slot.getId(),
      activityId: slot.getActivityId().toString(),
      startAt: slot.getStartAt().toISOString(),
      durationMinutes: conditions.durationMinutes,
      maxParticipants,
      remainingSeats: Math.max(0, maxParticipants - activeBookings),
      priceEur: conditions.priceEur,
      prerequisites: conditions.prerequisites,
    };
  }

  async createSlots(
    activityId: string,
    _userId: string,
    dto: CreateSlotsDto,
  ): Promise<CreateSlotsResponseDto> {
    const { dates: candidateDates, recurrence } = this.resolvePlan(dto);

    const existing = await this.slotRepository.findByActivityId(activityId);
    const existingTimes = new Set(
      (existing ?? []).map((s) => s.getStartAt().getTime()),
    );

    const toCreate: Date[] = [];
    const conflicts: SlotConflictDto[] = [];

    for (const date of candidateDates) {
      if (existingTimes.has(date.getTime())) {
        conflicts.push({
          startAt: date.toISOString(),
          reason: 'Un créneau existe déjà à cette date/heure',
        });
      } else {
        toCreate.push(date);
      }
    }

    if (toCreate.length === 0) {
      return { createdCount: 0, slots: [], conflicts };
    }

    const created = await this.slotRepository.createMany(
      activityId,
      // La borne resolue remplace celle du DTO : le sous-document Mongoose
      // exige untilDate, et on veut tracer l'horizon reellement applique.
      recurrence ? { ...dto, recurrence } : dto,
      toCreate,
    );

    const slots: SlotItemDto[] = created.map((s) => ({
      id: s.getId(),
      startAt: s.getStartAt().toISOString(),
    }));

    return { createdCount: created.length, slots, conflicts };
  }

  /**
   * Resout les dates a creer et, pour une recurrence, la borne effectivement
   * appliquee : celle fournie par le pro, ou l'horizon par defaut.
   */
  private resolvePlan(dto: CreateSlotsDto): {
    dates: Date[];
    recurrence?: RecurrenceDto;
  } {
    if (dto.recurrence) {
      const until = this.resolveUntil(dto.recurrence.untilDate);
      return {
        dates: this.expandRrule(dto.recurrence.rrule, until),
        recurrence: {
          rrule: dto.recurrence.rrule,
          untilDate: until.toISOString(),
        },
      };
    }

    if (dto.singleStartAt) {
      const date = new Date(dto.singleStartAt);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('singleStartAt est une date invalide');
      }
      return { dates: [date] };
    }

    throw new BadRequestException('Fournir soit recurrence soit singleStartAt');
  }

  private resolveUntil(untilDate?: string): Date {
    const until = untilDate
      ? new Date(untilDate)
      : SlotService.defaultRecurrenceHorizon();
    if (isNaN(until.getTime())) {
      throw new BadRequestException('untilDate est une date invalide');
    }
    return until;
  }

  /** Horizon applique a une recurrence sans date de fin : 12 mois. */
  private static defaultRecurrenceHorizon(): Date {
    const horizon = new Date();
    horizon.setFullYear(horizon.getFullYear() + 1);
    return horizon;
  }

  // Une RRULE sans borne est infinie : `all()` ne peut pas la developper, d'ou
  // la borne obligatoire resolue en amont par resolveUntil().
  private expandRrule(rruleStr: string, until: Date): Date[] {
    try {
      const rule = RRule.fromString(`RRULE:${rruleStr}`);
      const ruleWithUntil = new RRule({
        ...rule.origOptions,
        until,
      });

      return ruleWithUntil.all();
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException(
        `RRULE invalide: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}
