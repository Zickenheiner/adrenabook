import type { HealthProfileRepository } from '../../domain/repositories/health-profile.repository';
import type { HealthProfileEntity } from '../../domain/entities/health-profile.entity';
import type { HealthProfileRequestDto } from '../dtos/health-profile.dto';
import HealthProfileApi from '../datasources/health-profile.api';
import HealthProfileMapper from '../mappers/health-profile.mapper';

class HealthProfileRepositoryImpl implements HealthProfileRepository {
  constructor(
    private readonly api: HealthProfileApi = new HealthProfileApi(),
    private readonly mapper: HealthProfileMapper = new HealthProfileMapper(),
  ) {}

  async update(data: HealthProfileRequestDto): Promise<HealthProfileEntity> {
    const dto = await this.api.update(data);
    return this.mapper.toEntity(dto);
  }
}

export default HealthProfileRepositoryImpl;
