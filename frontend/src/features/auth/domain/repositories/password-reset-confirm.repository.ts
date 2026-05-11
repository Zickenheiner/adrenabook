import type { PasswordResetConfirmEntity } from '../entities/password-reset-confirm.entity';
import type { PasswordResetConfirmRequestDto } from '../../data/dtos/password-reset-confirm.dto';

export interface PasswordResetConfirmRepository {
  confirm(
    data: PasswordResetConfirmRequestDto,
  ): Promise<PasswordResetConfirmEntity>;
}
