import type {
  RgpdDeleteEntity,
  RgpdExportEntity,
} from '../../domain/entities/rgpd.entity';
import type {
  RgpdDeleteResponseDto,
  RgpdExportResponseDto,
} from '../dtos/rgpd.dto';

class RgpdMapper {
  toExportEntity(dto: RgpdExportResponseDto): RgpdExportEntity {
    return {
      requestId: dto.requestId,
      status: dto.status,
      estimatedReadyAt: new Date(dto.estimatedReadyAt),
      downloadUrl: dto.downloadUrl,
    };
  }

  toDeleteEntity(dto: RgpdDeleteResponseDto): RgpdDeleteEntity {
    return {
      requestId: dto.requestId,
      scheduledDeletionAt: new Date(dto.scheduledDeletionAt),
      retainedData: dto.retainedData,
    };
  }
}

export default RgpdMapper;
