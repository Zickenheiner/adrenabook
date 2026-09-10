import type { PasswordResetRequestRepository } from '../../domain/repositories/password-reset-request.repository';
import type { PasswordResetRequestEntity } from '../../domain/entities/password-reset-request.entity';
import type { PasswordResetRequestRequestDto } from '../dtos/password-reset-request.dto';
import PasswordResetRequestApi from '../datasources/password-reset-request.api';
import PasswordResetRequestMapper from '../mappers/password-reset-request.mapper';

class PasswordResetRequestRepositoryImpl implements PasswordResetRequestRepository {
  constructor(
    private readonly api: PasswordResetRequestApi = new PasswordResetRequestApi(),
    private readonly mapper: PasswordResetRequestMapper = new PasswordResetRequestMapper(),
  ) {}

  async request(
    data: PasswordResetRequestRequestDto,
  ): Promise<PasswordResetRequestEntity> {
    const dto = await this.api.request(data);
    return this.mapper.toEntity(dto);
  }
}

export default PasswordResetRequestRepositoryImpl;
