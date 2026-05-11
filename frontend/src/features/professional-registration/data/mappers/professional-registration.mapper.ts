import type { ProfessionalRegistrationEntity } from '../../domain/entities/professional-registration.entity';
import type { RegisterProfessionalResponseDto } from '../dtos/professional-registration.dto';

class ProfessionalRegistrationMapper {
  toEntity(
    dto: RegisterProfessionalResponseDto,
  ): ProfessionalRegistrationEntity {
    return {
      centerId: dto.centerId,
      status: dto.status,
      estimatedReviewTime: dto.estimatedReviewTime,
    };
  }
}

export default ProfessionalRegistrationMapper;
