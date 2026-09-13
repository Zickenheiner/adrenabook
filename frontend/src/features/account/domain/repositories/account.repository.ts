import type { AccountEntity } from '../entities/account.entity';

export interface AccountRepository {
  getById(id: string): Promise<AccountEntity>;
}
