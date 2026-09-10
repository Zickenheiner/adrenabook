import type { DashboardRepository } from '../../domain/repositories/dashboard.repository';
import type { DashboardEntity } from '../../domain/entities/dashboard.entity';
import DashboardApi from '../datasources/dashboard.api';
import DashboardMapper from '../mappers/dashboard.mapper';

class DashboardRepositoryImpl implements DashboardRepository {
  constructor(
    private readonly api: DashboardApi = new DashboardApi(),
    private readonly mapper: DashboardMapper = new DashboardMapper(),
  ) {}

  async getDashboard(): Promise<DashboardEntity> {
    const dto = await this.api.getDashboard();
    return this.mapper.toEntity(dto);
  }
}

export default DashboardRepositoryImpl;
