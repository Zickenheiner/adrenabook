import type { CenterDetailRepository } from '../../domain/repositories/center-detail.repository';
import type { CenterDetailEntity } from '../../domain/entities/center-detail.entity';
import CenterDetailApi from '../datasources/center-detail.api';
import CenterDetailMapper from '../mappers/center-detail.mapper';

class CenterDetailRepositoryImpl implements CenterDetailRepository {
  constructor(
    private readonly api: CenterDetailApi = new CenterDetailApi(),
    private readonly mapper: CenterDetailMapper = new CenterDetailMapper(),
  ) {}

  async getById(id: string): Promise<CenterDetailEntity> {
    const dto = await this.api.getById(id);
    return this.mapper.toEntity(dto);
  }
}

export default CenterDetailRepositoryImpl;
