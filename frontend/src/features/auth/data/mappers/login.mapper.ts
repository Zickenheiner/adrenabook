import type { LoginEntity } from '../../domain/entities/login.entity';
import type { LoginResponseDto } from '../dtos/login.dto';

class LoginMapper {
  toEntity(dto: LoginResponseDto): LoginEntity {
    return {
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
      user: {
        id: dto.user.id,
        email: dto.user.email,
        role: dto.user.role,
      },
    };
  }
}

export default LoginMapper;
