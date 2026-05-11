import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  RegisterRequestDto,
  RegisterResponseDto,
} from '../dtos/register.dto';

class RegisterApi {
  constructor(private readonly baseUrl: string = endpoints.auth.register) {}

  async register(data: RegisterRequestDto): Promise<RegisterResponseDto> {
    return request<RegisterResponseDto>({
      url: this.baseUrl,
      method: methods.POST,
      data,
    });
  }
}

export default RegisterApi;
