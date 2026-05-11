import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import { METHODS } from '@/core/constants/methods';
import type {
  RegisterProfessionalRequestDto,
  RegisterProfessionalResponseDto,
} from '../dtos/professional-registration.dto';

class ProfessionalRegistrationApi {
  constructor(
    private readonly baseUrl: string = endpoints.professionalAuth.register,
  ) {}

  async register(
    data: RegisterProfessionalRequestDto,
  ): Promise<RegisterProfessionalResponseDto> {
    return request<RegisterProfessionalResponseDto>({
      url: this.baseUrl,
      method: METHODS.POST,
      data,
    });
  }
}

export default ProfessionalRegistrationApi;
