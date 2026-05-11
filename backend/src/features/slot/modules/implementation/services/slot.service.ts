import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ISlotService } from '../../../interfaces/services/slot.iservice';
import { ISlotRepository } from '@features/slot/interfaces/repositories/slot.irepository';
import {
  CreateSlotsDto,
  CreateSlotsResponseDto,
  SlotConflictDto,
  SlotItemDto,
} from '@features/slot/domains/dtos/slot.dto';
import { RRule } from 'rrule';

@Injectable()
export class SlotService implements ISlotService {
  constructor(
    @Inject('ISlotRepository')
    private readonly slotRepository: ISlotRepository,
  ) {}

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

  private expandRrule(rruleStr: string, untilDate: string): Date[] {
    try {
      const until = new Date(untilDate);
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
