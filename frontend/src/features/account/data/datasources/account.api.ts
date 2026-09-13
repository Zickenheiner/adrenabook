import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type { AccountResponseDto } from '../dtos/account.dto';

class AccountApi {
  async getById(id: string): Promise<AccountResponseDto> {
    return request<AccountResponseDto>({
      url: endpoints.users.byId(id),
      method: methods.GET,
    });
  }
}

export default AccountApi;
