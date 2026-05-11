import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type { LoginRequestDto, LoginResponseDto } from '../dtos/login.dto';

class LoginApi {
  constructor(private readonly baseUrl: string = endpoints.auth.login) {}

  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    return request<LoginResponseDto>({
      url: this.baseUrl,
      method: methods.POST,
      data,
    });
  }
}

export default LoginApi;
