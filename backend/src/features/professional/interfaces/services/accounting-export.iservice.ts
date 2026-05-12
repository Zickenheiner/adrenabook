import { CreateAccountingExportDto } from '@features/professional/domains/dtos/accounting-export.dto';
import { AccountingExportResponseDto } from '@features/professional/domains/dtos/accounting-export.dto';

export interface IAccountingExportService {
  createExport(
    dto: CreateAccountingExportDto,
    professionalId: string,
    professionalEmail: string,
  ): Promise<AccountingExportResponseDto>;
}
