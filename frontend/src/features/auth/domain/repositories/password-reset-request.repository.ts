import type { PasswordResetRequestEntity } from '../entities/password-reset-request.entity';
import type { PasswordResetRequestRequestDto } from '../../data/dtos/password-reset-request.dto';

export interface PasswordResetRequestRepository {
  request(
    data: PasswordResetRequestRequestDto,
  ): Promise<PasswordResetRequestEntity>;
}
