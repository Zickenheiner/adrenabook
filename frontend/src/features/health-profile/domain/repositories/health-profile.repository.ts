import type { HealthProfileEntity } from '../entities/health-profile.entity';
import type { HealthProfileRequestDto } from '../../data/dtos/health-profile.dto';

export interface HealthProfileRepository {
  update(data: HealthProfileRequestDto): Promise<HealthProfileEntity>;
}
