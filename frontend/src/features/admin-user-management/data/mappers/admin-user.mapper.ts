import type {
  AdminUserEntity,
  AdminUserListEntity,
  UpdateUserStatusEntity,
} from '../../domain/entities/admin-user.entity';
import type {
  AdminUserListItemDto,
  AdminUserListResponseDto,
  UpdateUserStatusResponseDto,
} from '../dtos/admin-user.dto';

class AdminUserMapper {
  toEntity(dto: AdminUserListItemDto): AdminUserEntity {
    return {
      id: dto.id,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      status: dto.status,
      createdAt: new Date(dto.createdAt),
    };
  }

  toEntityList(dto: AdminUserListResponseDto): AdminUserListEntity {
    return {
      data: dto.data.map((item) => this.toEntity(item)),
      meta: dto.meta,
    };
  }

  toUpdateStatusEntity(
    dto: UpdateUserStatusResponseDto,
  ): UpdateUserStatusEntity {
    return {
      userId: dto.userId,
      previousStatus: dto.previousStatus,
      newStatus: dto.newStatus,
      effectiveUntil: dto.effectiveUntil
        ? new Date(dto.effectiveUntil)
        : undefined,
      auditLogId: dto.auditLogId,
    };
  }
}

export default AdminUserMapper;
