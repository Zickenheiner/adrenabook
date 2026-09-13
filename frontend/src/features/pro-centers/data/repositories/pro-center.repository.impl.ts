import type { ProCenterRepository } from '../../domain/repositories/pro-center.repository';
import type { ProCenterEntity } from '../../domain/entities/pro-center.entity';
import ProCenterApi from '../datasources/pro-center.api';
import ProCenterMapper from '../mappers/pro-center.mapper';

class ProCenterRepositoryImpl implements ProCenterRepository {
  constructor(
    private readonly api: ProCenterApi = new ProCenterApi(),
    private readonly mapper: ProCenterMapper = new ProCenterMapper(),
  ) {}

  async getMine(): Promise<ProCenterEntity[]> {
    const dtos = await this.api.getMine();
    return (dtos ?? []).map((dto) => this.mapper.toEntity(dto));
  }
}

export default ProCenterRepositoryImpl;
