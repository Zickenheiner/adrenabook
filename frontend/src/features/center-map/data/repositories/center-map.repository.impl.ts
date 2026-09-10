import type { CenterMapRepository } from '../../domain/repositories/center-map.repository';
import type { CentersMapEntity } from '../../domain/entities/center-map.entity';
import type { CentersMapQueryDto } from '../dtos/center-map.dto';
import CenterMapApi from '../datasources/center-map.api';
import CenterMapMapper from '../mappers/center-map.mapper';

class CenterMapRepositoryImpl implements CenterMapRepository {
  constructor(
    private readonly api: CenterMapApi = new CenterMapApi(),
    private readonly mapper: CenterMapMapper = new CenterMapMapper(),
  ) {}

  async getMap(query: CentersMapQueryDto): Promise<CentersMapEntity> {
    const dto = await this.api.getMap(query);
    return this.mapper.toEntity(dto);
  }
}

export default CenterMapRepositoryImpl;
