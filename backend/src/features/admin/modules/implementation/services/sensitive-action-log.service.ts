import { Inject, Injectable } from '@nestjs/common';
import { ISensitiveActionLogService } from '../../../interfaces/services/sensitive-action-log.iservice';
import { ISensitiveActionLogRepository } from '@features/admin/interfaces/repositories/sensitive-action-log.irepository';
import {
  AuditLogItemDto,
  AuditLogsQueryDto,
  AuditLogsResponseDto,
  CreateSensitiveActionLogDto,
} from '@features/admin/domains/dtos/sensitive-action-log.dto';
import { SensitiveActionLogEntity } from '@features/admin/domains/entities/sensitive-action-log.entity';

@Injectable()
export class SensitiveActionLogService implements ISensitiveActionLogService {
  constructor(
    @Inject('ISensitiveActionLogRepository')
    private readonly sensitiveActionLogRepository: ISensitiveActionLogRepository,
  ) {}

  async findAuditLogs(query: AuditLogsQueryDto): Promise<AuditLogsResponseDto> {
    const { items, total } =
      await this.sensitiveActionLogRepository.findWithFilters(query);

    return {
      items: items.map((entity) => this.toDto(entity)),
      total,
    };
  }

  async createLog(
    dto: CreateSensitiveActionLogDto,
  ): Promise<SensitiveActionLogEntity> {
    return this.sensitiveActionLogRepository.create(dto);
  }

  private toDto(entity: SensitiveActionLogEntity): AuditLogItemDto {
    return {
      id: entity.getId(),
      timestamp: entity.getTimestamp().toISOString(),
      actorId: entity.getActorId(),
      actorRole: entity.getActorRole(),
      actionType: entity.getActionType(),
      targetType: entity.getTargetType(),
      targetId: entity.getTargetId(),
      severity: entity.getSeverity(),
      ipAddress: entity.getIpAddress() ?? '',
      userAgent: entity.getUserAgent() ?? '',
      metadata: entity.getMetadata() ?? {},
      integrityHash: entity.getIntegrityHash(),
    };
  }
}
