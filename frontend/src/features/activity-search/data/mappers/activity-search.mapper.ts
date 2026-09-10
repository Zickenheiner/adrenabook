import type {
  ActivityItemEntity,
  ActivitySearchResultEntity,
} from '../../domain/entities/activity-search.entity';
import type {
  ActivityItemResponseDto,
  SearchActivitiesResponseDto,
} from '../dtos/activity-search.dto';

class ActivitySearchMapper {
  toItemEntity(dto: ActivityItemResponseDto): ActivityItemEntity {
    return {
      id: dto.id,
      title: dto.title,
      type: dto.type,
      priceFromEur: dto.priceFromEur,
      durationMinutes: dto.durationMinutes,
      difficulty: dto.difficulty,
      centerName: dto.centerName,
      distanceKm: dto.distanceKm,
      rating: dto.rating,
      coverPhotoUrl: dto.coverPhotoUrl,
    };
  }

  toEntity(dto: SearchActivitiesResponseDto): ActivitySearchResultEntity {
    return {
      items: dto.items.map((item) => this.toItemEntity(item)),
      total: dto.total,
      page: dto.page,
      pageSize: dto.pageSize,
    };
  }
}

export default ActivitySearchMapper;
