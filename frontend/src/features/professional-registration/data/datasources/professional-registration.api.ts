import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  CreateProfessionalCenterRequestDto,
  CreateProfessionalCenterResponseDto,
} from '../dtos/professional-registration.dto';

class ProfessionalRegistrationApi {
  constructor(
    private readonly baseUrl: string = endpoints.professionalCenter.create,
  ) {}

  async create(
    data: CreateProfessionalCenterRequestDto,
  ): Promise<CreateProfessionalCenterResponseDto> {
    return request<CreateProfessionalCenterResponseDto>({
      url: this.baseUrl,
      method: methods.POST,
      data,
    });
  }
}

export default ProfessionalRegistrationApi;
