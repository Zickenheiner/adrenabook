import type { ProfessionalRegistrationEntity } from '../entities/professional-registration.entity';
import type { CreateProfessionalCenterRequestDto } from '../../data/dtos/professional-registration.dto';

export interface ProfessionalRegistrationRepository {
  create(
    data: CreateProfessionalCenterRequestDto,
  ): Promise<ProfessionalRegistrationEntity>;
}
