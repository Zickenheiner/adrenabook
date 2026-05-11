import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  PasswordResetRequestRequestDto,
  PasswordResetRequestResponseDto,
} from '../dtos/password-reset-request.dto';

class PasswordResetRequestApi {
  constructor(
    private readonly baseUrl: string = endpoints.auth.passwordResetRequest,
  ) {}

  async request(
    data: PasswordResetRequestRequestDto,
  ): Promise<PasswordResetRequestResponseDto> {
    return request<PasswordResetRequestResponseDto>({
      url: this.baseUrl,
      method: methods.POST,
      data,
    });
  }
}

export default PasswordResetRequestApi;
