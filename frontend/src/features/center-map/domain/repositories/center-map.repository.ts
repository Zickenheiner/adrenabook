import type { CentersMapEntity } from '../entities/center-map.entity';
import type { CentersMapQueryDto } from '../../data/dtos/center-map.dto';

export interface CenterMapRepository {
  getMap(query: CentersMapQueryDto): Promise<CentersMapEntity>;
}
