import type { AccountingExportEntity } from '../../domain/entities/accounting-export.entity';
import type { AccountingExportResponseDto } from '../dtos/accounting-export.dto';

class AccountingExportMapper {
  toEntity(dto: AccountingExportResponseDto): AccountingExportEntity {
    return {
      exportJobId: dto.exportJobId,
      status: dto.status,
      downloadUrl: dto.downloadUrl,
      emailDeliveredTo: dto.emailDeliveredTo,
      recordsCount: dto.recordsCount,
    };
  }
}

export default AccountingExportMapper;
