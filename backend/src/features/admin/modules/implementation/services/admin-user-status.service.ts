import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAdminUserStatusService } from '@features/admin/interfaces/services/admin-user-status.iservice';
import { IAuditLogService } from '@features/admin/interfaces/services/audit-log.iservice';
import { IUserService } from '@features/auth/interfaces/services/user.iservice';
import { IUserRepository } from '@features/auth/interfaces/repositories/user.irepository';
import {
  UpdateUserStatusDto,
  UpdateUserStatusResponseDto,
} from '@features/admin/domains/dtos/update-user-status.dto';

@Injectable()
export class AdminUserStatusService implements IAdminUserStatusService {
  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IAuditLogService')
    private readonly auditLogService: IAuditLogService,
  ) {}

  async updateUserStatus(
    userId: string,
    dto: UpdateUserStatusDto,
    adminId: string,
  ): Promise<UpdateUserStatusResponseDto> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const previousStatus = user.getStatus() ?? 'active';
    const newStatus = dto.status;

    let effectiveUntil: Date | undefined;
    if (newStatus === 'suspended' && dto.durationDays) {
      effectiveUntil = new Date(
        Date.now() + dto.durationDays * 24 * 60 * 60 * 1000,
      );
    }

    await this.userRepository.updateStatus(userId, newStatus);

    const auditLog = await this.auditLogService.createLog({
      targetUserId: userId,
      adminId,
      previousStatus,
      newStatus,
      reason: dto.reason,
      durationDays: dto.durationDays,
      effectiveUntil,
    });

    return {
      userId,
      previousStatus,
      newStatus,
      effectiveUntil: effectiveUntil?.toISOString(),
      auditLogId: auditLog.getId(),
    };
  }
}
