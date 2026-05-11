import type {
  CreateSlotsResultEntity,
  SlotConflictEntity,
  SlotSummaryEntity,
} from '../../domain/entities/slot.entity';
import type {
  CreateSlotsResponseDto,
  SlotConflictDto,
  SlotSummaryDto,
} from '../dtos/slot.dto';

class SlotMapper {
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
