import type { RegisterEntity } from '../../domain/entities/register.entity';
import type { RegisterResponseDto } from '../dtos/register.dto';

class RegisterMapper {
  toEntity(dto: RegisterResponseDto): RegisterEntity {
    return {
      userId: dto.userId,
      email: dto.email,
      emailVerificationSent: dto.emailVerificationSent,
    };
  }
}

export default RegisterMapper;
