import type { AccountingExportRepository } from '../../domain/repositories/accounting-export.repository';
import type { AccountingExportEntity } from '../../domain/entities/accounting-export.entity';
import type { AccountingExportRequestDto } from '../dtos/accounting-export.dto';
import AccountingExportApi from '../datasources/accounting-export.api';
import AccountingExportMapper from '../mappers/accounting-export.mapper';

class AccountingExportRepositoryImpl implements AccountingExportRepository {
  constructor(
    private readonly api: AccountingExportApi = new AccountingExportApi(),
    private readonly mapper: AccountingExportMapper = new AccountingExportMapper(),
  ) {}

  async create(
    data: AccountingExportRequestDto,
  ): Promise<AccountingExportEntity> {
    const dto = await this.api.create(data);
    return this.mapper.toEntity(dto);
  }
}

export default AccountingExportRepositoryImpl;
