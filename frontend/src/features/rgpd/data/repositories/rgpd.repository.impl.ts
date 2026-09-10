import type { RgpdRepository } from '../../domain/repositories/rgpd.repository';
import type {
  RgpdDeleteEntity,
  RgpdExportEntity,
} from '../../domain/entities/rgpd.entity';
import type { RgpdDeleteRequestDto } from '../dtos/rgpd.dto';
import RgpdApi from '../datasources/rgpd.api';
import RgpdMapper from '../mappers/rgpd.mapper';

class RgpdRepositoryImpl implements RgpdRepository {
  constructor(
    private readonly api: RgpdApi = new RgpdApi(),
    private readonly mapper: RgpdMapper = new RgpdMapper(),
  ) {}

  async requestExport(): Promise<RgpdExportEntity> {
    const dto = await this.api.requestExport();
    return this.mapper.toExportEntity(dto);
  }

  async requestDelete(data: RgpdDeleteRequestDto): Promise<RgpdDeleteEntity> {
    const dto = await this.api.requestDelete(data);
    return this.mapper.toDeleteEntity(dto);
  }
}

export default RgpdRepositoryImpl;
