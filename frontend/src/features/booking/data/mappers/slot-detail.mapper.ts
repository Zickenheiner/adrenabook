import type { SlotDetailEntity } from '../../domain/entities/slot-detail.entity';
import type { SlotDetailResponseDto } from '../dtos/slot-detail.dto';

class SlotDetailMapper {
  toEntity(dto: SlotDetailResponseDto): SlotDetailEntity {
    return {
      id: dto.id,
      activityId: dto.activityId,
      startAt: new Date(dto.startAt),
      durationMinutes: dto.durationMinutes,
      maxParticipants: dto.maxParticipants,
      remainingSeats: dto.remainingSeats,
      priceEur: dto.priceEur,
    };
  }
}

export default SlotDetailMapper;
