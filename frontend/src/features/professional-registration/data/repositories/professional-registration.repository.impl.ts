import type { ProfessionalRegistrationRepository } from '../../domain/repositories/professional-registration.repository';
import type { ProfessionalRegistrationEntity } from '../../domain/entities/professional-registration.entity';
import type { CreateProfessionalCenterRequestDto } from '../dtos/professional-registration.dto';
import ProfessionalRegistrationApi from '../datasources/professional-registration.api';
import ProfessionalRegistrationMapper from '../mappers/professional-registration.mapper';

class ProfessionalRegistrationRepositoryImpl implements ProfessionalRegistrationRepository {
  constructor(
    private readonly api: ProfessionalRegistrationApi = new ProfessionalRegistrationApi(),
    private readonly mapper: ProfessionalRegistrationMapper = new ProfessionalRegistrationMapper(),
  ) {}

  async create(
    data: CreateProfessionalCenterRequestDto,
  ): Promise<ProfessionalRegistrationEntity> {
    const dto = await this.api.create(data);
    return this.mapper.toEntity(dto);
  }
}

export default ProfessionalRegistrationRepositoryImpl;
