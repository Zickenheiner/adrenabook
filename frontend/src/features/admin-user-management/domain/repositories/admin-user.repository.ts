import type {
  AdminUserListEntity,
  UpdateUserStatusEntity,
} from '../entities/admin-user.entity';
import type { UpdateUserStatusRequestDto } from '../../data/dtos/admin-user.dto';

export interface AdminUserRepository {
  getUsers(page?: number, limit?: number): Promise<AdminUserListEntity>;
  updateStatus(
    id: string,
    data: UpdateUserStatusRequestDto,
  ): Promise<UpdateUserStatusEntity>;
}
