import type { RegisterEntity } from '../entities/register.entity';
import type { RegisterRequestDto } from '../../data/dtos/register.dto';

export interface RegisterRepository {
  register(data: RegisterRequestDto): Promise<RegisterEntity>;
}
