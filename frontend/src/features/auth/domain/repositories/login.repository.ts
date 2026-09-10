import type { LoginEntity } from '../entities/login.entity';
import type { LoginRequestDto } from '../../data/dtos/login.dto';

export interface LoginRepository {
  login(data: LoginRequestDto): Promise<LoginEntity>;
}
