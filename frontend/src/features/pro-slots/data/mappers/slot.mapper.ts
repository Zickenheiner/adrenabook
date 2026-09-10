import type {
  CreateSlotsResultEntity,
  ProSlotEntity,
  SlotConflictEntity,
  SlotSummaryEntity,
} from '../../domain/entities/slot.entity';
import type {
  CreateSlotsResponseDto,
  ProSlotDto,
  SlotConflictDto,
  SlotSummaryDto,
} from '../dtos/slot.dto';

class SlotMapper {
  toProSlotEntity(dto: ProSlotDto): ProSlotEntity {
    return {
      id: dto.id,
      startAt: new Date(dto.startAt),
      durationMinutes: dto.durationMinutes,
      maxParticipants: dto.maxParticipants,
      remainingSeats: dto.remainingSeats,
      priceEur: dto.priceEur,
    };
  }

  toSlotSummaryEntity(dto: SlotSummaryDto): SlotSummaryEntity {
    return {
      id: dto.id,
      startAt: new Date(dto.startAt),
    };
  }

  toSlotConflictEntity(dto: SlotConflictDto): SlotConflictEntity {
    return {
      startAt: new Date(dto.startAt),
      reason: dto.reason,
    };
  }

  toCreateResultEntity(dto: CreateSlotsResponseDto): CreateSlotsResultEntity {
    return {
      createdCount: dto.createdCount,
      slots: dto.slots.map((s) => this.toSlotSummaryEntity(s)),
      conflicts: dto.conflicts.map((c) => this.toSlotConflictEntity(c)),
    };
  }
}

export default SlotMapper;
