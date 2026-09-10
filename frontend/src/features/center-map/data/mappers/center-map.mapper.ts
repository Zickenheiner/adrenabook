import type {
  CenterMapItemEntity,
  CentersMapEntity,
} from '../../domain/entities/center-map.entity';
import type {
  CenterMapItemDto,
  CentersMapResponseDto,
} from '../dtos/center-map.dto';

class CenterMapMapper {
  toItemEntity(dto: CenterMapItemDto): CenterMapItemEntity {
    return {
      id: dto.id,
      name: dto.name,
      lat: dto.lat,
      lng: dto.lng,
      city: dto.city,
      activitiesCount: dto.activitiesCount,
    };
  }

  toEntity(dto: CentersMapResponseDto): CentersMapEntity {
    return {
      centers: dto.centers.map((item) => this.toItemEntity(item)),
    };
  }
}

export default CenterMapMapper;
