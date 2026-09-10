import type { HealthProfileEntity } from '../../domain/entities/health-profile.entity';
import type { HealthProfileResponseDto } from '../dtos/health-profile.dto';

class HealthProfileMapper {
  toEntity(dto: HealthProfileResponseDto): HealthProfileEntity {
    return {
      updated: dto.updated,
      fieldsEncrypted: dto.fieldsEncrypted,
    };
  }
}

export default HealthProfileMapper;
