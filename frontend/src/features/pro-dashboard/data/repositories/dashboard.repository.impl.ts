import type { DashboardRepository } from '../../domain/repositories/dashboard.repository';
import type { DashboardEntity } from '../../domain/entities/dashboard.entity';
import type { DashboardQueryDto } from '../dtos/dashboard.dto';
import DashboardApi from '../datasources/dashboard.api';
import DashboardMapper from '../mappers/dashboard.mapper';

class DashboardRepositoryImpl implements DashboardRepository {
  constructor(
    private readonly api: DashboardApi = new DashboardApi(),
    private readonly mapper: DashboardMapper = new DashboardMapper(),
  ) {}

  async get(query: DashboardQueryDto): Promise<DashboardEntity> {
    const dto = await this.api.get(query);
    return this.mapper.toEntity(dto);
  }
}

export default DashboardRepositoryImpl;
