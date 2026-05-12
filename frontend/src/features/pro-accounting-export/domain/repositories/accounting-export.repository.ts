import type { AccountingExportEntity } from '../entities/accounting-export.entity';
import type { AccountingExportRequestDto } from '../../data/dtos/accounting-export.dto';

export interface AccountingExportRepository {
  create(data: AccountingExportRequestDto): Promise<AccountingExportEntity>;
}
