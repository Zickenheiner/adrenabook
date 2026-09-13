import type { AccountEntity } from '../../domain/entities/account.entity';
import type { AccountResponseDto } from '../dtos/account.dto';

class AccountMapper {
  toEntity(dto: AccountResponseDto): AccountEntity {
    return {
      id: dto.id,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      // L'API renvoie un instant ISO complet ; les formulaires attendent une
      // date seule.
      birthDate: dto.birthDate ? dto.birthDate.slice(0, 10) : '',
    };
  }
}

export default AccountMapper;
