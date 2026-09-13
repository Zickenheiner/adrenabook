import type { AccountRepository } from '../../domain/repositories/account.repository';
import type { AccountEntity } from '../../domain/entities/account.entity';
import AccountApi from '../datasources/account.api';
import AccountMapper from '../mappers/account.mapper';

class AccountRepositoryImpl implements AccountRepository {
  constructor(
    private readonly api = new AccountApi(),
    private readonly mapper = new AccountMapper(),
  ) {}

  async getById(id: string): Promise<AccountEntity> {
    const dto = await this.api.getById(id);
    return this.mapper.toEntity(dto);
  }
}

export default AccountRepositoryImpl;
