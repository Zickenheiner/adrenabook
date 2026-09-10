import type { PasswordResetRequestEntity } from '../../domain/entities/password-reset-request.entity';
import type { PasswordResetRequestResponseDto } from '../dtos/password-reset-request.dto';

class PasswordResetRequestMapper {
  toEntity(dto: PasswordResetRequestResponseDto): PasswordResetRequestEntity {
    return {
      message: dto.message,
    };
  }
}

export default PasswordResetRequestMapper;
