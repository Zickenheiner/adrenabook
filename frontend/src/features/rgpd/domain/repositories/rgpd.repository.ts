import type {
  RgpdDeleteEntity,
  RgpdExportEntity,
} from '../entities/rgpd.entity';
import type { RgpdDeleteRequestDto } from '../../data/dtos/rgpd.dto';

export interface RgpdRepository {
  requestExport(): Promise<RgpdExportEntity>;
  requestDelete(data: RgpdDeleteRequestDto): Promise<RgpdDeleteEntity>;
}
