import type { PasswordResetConfirmEntity } from '../../domain/entities/password-reset-confirm.entity';
import type { PasswordResetConfirmResponseDto } from '../dtos/password-reset-confirm.dto';

class PasswordResetConfirmMapper {
  toEntity(dto: PasswordResetConfirmResponseDto): PasswordResetConfirmEntity {
    return {
      message: dto.message,
    };
  }
}

export default PasswordResetConfirmMapper;
