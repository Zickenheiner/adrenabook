import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAdminUserStatusService } from '@features/admin/interfaces/services/admin-user-status.iservice';
import { IAuditLogService } from '@features/admin/interfaces/services/audit-log.iservice';
import { ISensitiveActionLogService } from '@features/admin/interfaces/services/sensitive-action-log.iservice';
import { IUserService } from '@features/auth/interfaces/services/user.iservice';
import { IUserRepository } from '@features/auth/interfaces/repositories/user.irepository';
import {
  UpdateUserStatusDto,
  UpdateUserStatusResponseDto,
} from '@features/admin/domains/dtos/update-user-status.dto';
import {
  AdminUserListItemDto,
  AdminUserListResponseDto,
} from '@features/admin/domains/dtos/admin-user-list.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@features/auth/domains/schemas/user.schema';

@Injectable()
export class AdminUserStatusService implements IAdminUserStatusService {
  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IAuditLogService')
    private readonly auditLogService: IAuditLogService,
    @Inject('ISensitiveActionLogService')
    private readonly sensitiveActionLogService: ISensitiveActionLogService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // ——— Lecture du back-office (US-22) ———

  /**
   * Projette un document utilisateur vers la vue administrateur.
   *
   * On projette explicitement plutot que de renvoyer l'entite : cela garantit
   * qu'aucun secret (mot de passe, refreshTokenHash, jetons) ne fuit par cette
   * route, meme si le schema evolue.
   */
  private toListItem(doc: UserDocument): AdminUserListItemDto {
    return {
      id: doc._id.toString(),
      email: doc.email,
      firstName: doc.firstName,
      lastName: doc.lastName,
      role: (doc.role ?? '').toLowerCase(),
      status: doc.status ?? 'active',
      createdAt: (doc as { createdAt?: Date }).createdAt?.toISOString() ?? '',
    };
  }

  async listUsers(
    page: number,
    limit: number,
  ): Promise<AdminUserListResponseDto> {
    const [docs, total] = await Promise.all([
      this.userModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return {
      data: docs.map((d) => this.toListItem(d)),
      meta: {
        total,
        page,
        limit,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }

  async getUser(id: string): Promise<AdminUserListItemDto> {
    const doc = await this.userModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException('Compte introuvable');
    }
    return this.toListItem(doc);
  }

  async updateUserStatus(
    userId: string,
    dto: UpdateUserStatusDto,
    adminId: string,
    adminRole: string,
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

    // Journal des actions sensibles (US-25) : qui / quoi / sur quoi / quand.
    await this.sensitiveActionLogService.createLog({
      actorId: adminId,
      actorRole: adminRole,
      actionType: 'user.status_changed',
      targetType: 'User',
      targetId: userId,
      severity: newStatus === 'active' ? 'info' : 'warning',
      metadata: {
        previousStatus,
        newStatus,
        reason: dto.reason,
        durationDays: dto.durationDays,
        effectiveUntil: effectiveUntil?.toISOString(),
        auditLogId: auditLog.getId(),
      },
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
