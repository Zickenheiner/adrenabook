import type { AdminUserRepository } from '../../domain/repositories/admin-user.repository';
import type {
  AdminUserListEntity,
  UpdateUserStatusEntity,
} from '../../domain/entities/admin-user.entity';
import type { UpdateUserStatusRequestDto } from '../dtos/admin-user.dto';
import AdminUserApi from '../datasources/admin-user.api';
import AdminUserMapper from '../mappers/admin-user.mapper';

class AdminUserRepositoryImpl implements AdminUserRepository {
  constructor(
    private readonly api: AdminUserApi = new AdminUserApi(),
    private readonly mapper: AdminUserMapper = new AdminUserMapper(),
  ) {}

  async getUsers(
    page: number = 1,
    limit: number = 20,
  ): Promise<AdminUserListEntity> {
    const dto = await this.api.getUsers(page, limit);
    return this.mapper.toEntityList(dto);
  }

  async updateStatus(
    id: string,
    data: UpdateUserStatusRequestDto,
  ): Promise<UpdateUserStatusEntity> {
    const dto = await this.api.updateStatus(id, data);
    return this.mapper.toUpdateStatusEntity(dto);
  }
}

export default AdminUserRepositoryImpl;
