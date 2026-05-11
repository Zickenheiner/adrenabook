import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  PasswordResetConfirmRequestDto,
  PasswordResetConfirmResponseDto,
} from '../dtos/password-reset-confirm.dto';

class PasswordResetConfirmApi {
  constructor(
    private readonly baseUrl: string = endpoints.auth.passwordResetConfirm,
  ) {}

  async confirm(
    data: PasswordResetConfirmRequestDto,
  ): Promise<PasswordResetConfirmResponseDto> {
    return request<PasswordResetConfirmResponseDto>({
      url: this.baseUrl,
      method: methods.POST,
      data,
    });
  }
}

export default PasswordResetConfirmApi;
