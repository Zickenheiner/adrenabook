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
      activitiesCount: dto.activitiesCount,
      cluster: dto.cluster ?? false,
      clusterSize: dto.clusterSize,
    };
  }

  toEntity(dto: CentersMapResponseDto): CentersMapEntity {
    return {
      centers: dto.centers.map((item) => this.toItemEntity(item)),
    };
  }
}

export default CenterMapMapper;
