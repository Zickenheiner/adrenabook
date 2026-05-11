import type { ProfessionalRegistrationEntity } from '../entities/professional-registration.entity';
import type { RegisterProfessionalRequestDto } from '../../data/dtos/professional-registration.dto';

export interface ProfessionalRegistrationRepository {
  register(
    data: RegisterProfessionalRequestDto,
  ): Promise<ProfessionalRegistrationEntity>;
}
