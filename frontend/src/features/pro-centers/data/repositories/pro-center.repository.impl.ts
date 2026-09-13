import type { ProCenterRepository } from '../../domain/repositories/pro-center.repository';
import type { ProCenterEntity } from '../../domain/entities/pro-center.entity';
import type { UpdateCenterRequestDto } from '../dtos/pro-center.dto';
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

  async update(id: string, data: UpdateCenterRequestDto): Promise<void> {
    return this.api.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.api.delete(id);
  }
}

export default ProCenterRepositoryImpl;
