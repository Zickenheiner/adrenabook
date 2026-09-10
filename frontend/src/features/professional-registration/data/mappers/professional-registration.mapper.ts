import type { ProfessionalRegistrationEntity } from '../../domain/entities/professional-registration.entity';
import type { CreateProfessionalCenterResponseDto } from '../dtos/professional-registration.dto';

class ProfessionalRegistrationMapper {
  toEntity(
    dto: CreateProfessionalCenterResponseDto,
  ): ProfessionalRegistrationEntity {
    return { submitted: dto === true };
  }
}

export default ProfessionalRegistrationMapper;
