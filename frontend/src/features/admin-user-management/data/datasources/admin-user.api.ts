import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  AdminUserListResponseDto,
  UpdateUserStatusRequestDto,
  UpdateUserStatusResponseDto,
} from '../dtos/admin-user.dto';

class AdminUserApi {
  constructor(private readonly baseUrl: string = endpoints.adminUsers.list) {}

  async getUsers(
    page: number = 1,
    limit: number = 20,
  ): Promise<AdminUserListResponseDto> {
    return request<AdminUserListResponseDto>({
      url: `${this.baseUrl}?page=${page}&limit=${limit}`,
      method: methods.GET,
    });
  }

  async updateStatus(
    id: string,
    data: UpdateUserStatusRequestDto,
  ): Promise<UpdateUserStatusResponseDto> {
    return request<UpdateUserStatusResponseDto>({
      url: endpoints.adminUsers.updateStatus(id),
      method: methods.PATCH,
      data,
    });
  }
}

export default AdminUserApi;
