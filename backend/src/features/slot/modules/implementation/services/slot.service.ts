import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ISlotService } from '../../../interfaces/services/slot.iservice';
import { ISlotRepository } from '@features/slot/interfaces/repositories/slot.irepository';
import {
  CreateSlotsDto,
  CreateSlotsResponseDto,
  ProSlotListItemDto,
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

    return this.buildSlotDetail(slot);
  }

  async findByActivityIdForOwner(
    activityId: string,
    userId: string,
  ): Promise<ProSlotListItemDto[]> {
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

    const slots = await this.slotRepository.findByActivityId(activityId);
    const sorted = [...(slots ?? [])].sort(
      (a, b) => a.getStartAt().getTime() - b.getStartAt().getTime(),
    );

    const details = await Promise.all(
      sorted.map((slot) => this.buildSlotDetail(slot)),
    );

    // activityId est volontairement omis : il est deja porte par l'URL
    return details.map((detail) => ({
      id: detail.id,
      startAt: detail.startAt,
      durationMinutes: detail.durationMinutes,
      maxParticipants: detail.maxParticipants,
      remainingSeats: detail.remainingSeats,
      priceEur: detail.priceEur,
    }));
  }

  /** Source unique du calcul de remainingSeats, partagee par GET /slots/:id */
  private async buildSlotDetail(
    slot: SlotEntity,
  ): Promise<SlotDetailResponseDto> {
    const activeBookings = await this.slotRepository.countActiveBookings(
      slot.getId(),
    );
    const maxParticipants = slot.getMaxParticipants();

    return {
      id: slot.getId(),
      activityId: slot.getActivityId().toString(),
      startAt: slot.getStartAt().toISOString(),
      durationMinutes: slot.getDurationMinutes(),
      maxParticipants,
      remainingSeats: Math.max(0, maxParticipants - activeBookings),
      priceEur: slot.getPriceEur(),
    };
  }

  async createSlots(
    activityId: string,
    _userId: string,
    dto: CreateSlotsDto,
  ): Promise<CreateSlotsResponseDto> {
    const candidateDates = this.resolveCandidateDates(dto);

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
      dto,
      toCreate,
    );

    const slots: SlotItemDto[] = created.map((s) => ({
      id: s.getId(),
      startAt: s.getStartAt().toISOString(),
    }));

    return { createdCount: created.length, slots, conflicts };
  }

  private resolveCandidateDates(dto: CreateSlotsDto): Date[] {
    if (dto.recurrence) {
      return this.expandRrule(dto.recurrence.rrule, dto.recurrence.untilDate);
    }

    if (dto.singleStartAt) {
      const date = new Date(dto.singleStartAt);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('singleStartAt est une date invalide');
      }
      return [date];
    }

    throw new BadRequestException('Fournir soit recurrence soit singleStartAt');
  }

  /** Horizon applique a une recurrence sans date de fin : 12 mois. */
  private static defaultRecurrenceHorizon(): Date {
    const horizon = new Date();
    horizon.setFullYear(horizon.getFullYear() + 1);
    return horizon;
  }

  private expandRrule(rruleStr: string, untilDate?: string): Date[] {
    try {
      // Une RRULE sans borne est infinie : `all()` ne peut pas la developper.
      // Sans date de fin choisie, on genere un an de creneaux.
      const until = untilDate
        ? new Date(untilDate)
        : SlotService.defaultRecurrenceHorizon();
      if (isNaN(until.getTime())) {
        throw new BadRequestException('untilDate est une date invalide');
      }

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
