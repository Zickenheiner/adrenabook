import { CreateAccountingExportDto } from '@features/professional/domains/dtos/accounting-export.dto';
import { AccountingExportEntity } from '@features/professional/domains/entities/accounting-export.entity';

export interface IAccountingExportRepository {
  create(
    dto: CreateAccountingExportDto,
    professionalId: string,
  ): Promise<AccountingExportEntity>;
  findById(id: string): Promise<AccountingExportEntity | null>;
}
