import {
  UpdateUserStatusDto,
  UpdateUserStatusResponseDto,
} from '@features/admin/domains/dtos/update-user-status.dto';
import {
  AdminUserListItemDto,
  AdminUserListResponseDto,
} from '@features/admin/domains/dtos/admin-user-list.dto';

export interface IAdminUserStatusService {
  updateUserStatus(
    userId: string,
    dto: UpdateUserStatusDto,
    adminId: string,
    adminRole: string,
  ): Promise<UpdateUserStatusResponseDto>;

  /** Liste paginee des comptes, du plus recent au plus ancien (US-22). */
  listUsers(page: number, limit: number): Promise<AdminUserListResponseDto>;

  /** Fiche d'un compte. Leve NotFoundException s'il n'existe pas. */
  getUser(id: string): Promise<AdminUserListItemDto>;
}
