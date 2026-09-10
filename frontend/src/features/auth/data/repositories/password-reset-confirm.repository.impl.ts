import type { PasswordResetConfirmRepository } from '../../domain/repositories/password-reset-confirm.repository';
import type { PasswordResetConfirmEntity } from '../../domain/entities/password-reset-confirm.entity';
import type { PasswordResetConfirmRequestDto } from '../dtos/password-reset-confirm.dto';
import PasswordResetConfirmApi from '../datasources/password-reset-confirm.api';
import PasswordResetConfirmMapper from '../mappers/password-reset-confirm.mapper';

class PasswordResetConfirmRepositoryImpl implements PasswordResetConfirmRepository {
  constructor(
    private readonly api: PasswordResetConfirmApi = new PasswordResetConfirmApi(),
    private readonly mapper: PasswordResetConfirmMapper = new PasswordResetConfirmMapper(),
  ) {}

  async confirm(
    data: PasswordResetConfirmRequestDto,
  ): Promise<PasswordResetConfirmEntity> {
    const dto = await this.api.confirm(data);
    return this.mapper.toEntity(dto);
  }
}

export default PasswordResetConfirmRepositoryImpl;
