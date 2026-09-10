import type { HealthRepository } from '../../domain/repositories/health.repository';
import type { HealthEntity } from '../../domain/entities/health.entity';
import HealthApi from '../datasources/health.api';
import HealthMapper from '../mappers/health.mapper';

class HealthRepositoryImpl implements HealthRepository {
  constructor(
    private readonly healthApi: HealthApi = new HealthApi(),
    private readonly healthMapper: HealthMapper = new HealthMapper(),
  ) {}

  async getHealth(): Promise<HealthEntity> {
    const dto = await this.healthApi.getHealth();
    return this.healthMapper.toEntity(dto);
  }
}

export default HealthRepositoryImpl;
