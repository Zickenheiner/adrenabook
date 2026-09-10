import type { ActivityDetailEntity } from '../../domain/entities/activity-detail.entity';
import type { ActivityDetailResponseDto } from '../dtos/activity-detail.dto';

class ActivityDetailMapper {
  toEntity(dto: ActivityDetailResponseDto): ActivityDetailEntity {
    return {
      ...dto,
      upcomingSlots: dto.upcomingSlots.map((slot) => ({
        ...slot,
        startAt: new Date(slot.startAt),
      })),
    };
  }
}

export default ActivityDetailMapper;
