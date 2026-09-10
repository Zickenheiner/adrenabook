import type { ActivityEntity } from '../../domain/entities/activity.entity';
import type { ActivityResponseDto } from '../dtos/activity.dto';

class ActivityMapper {
  toEntity(dto: ActivityResponseDto): ActivityEntity {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      type: dto.type,
      difficulty: dto.difficulty,
      durationMinutes: dto.durationMinutes,
      priceFromEur: dto.priceFromEur,
      prerequisites: dto.prerequisites,
      includedEquipment: dto.includedEquipment,
      photoFileIds: dto.photoFileIds,
      status: dto.status,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    };
  }

  toEntityList(dtos: ActivityResponseDto[]): ActivityEntity[] {
    return dtos.map((dto) => this.toEntity(dto));
  }
}

export default ActivityMapper;
