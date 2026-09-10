import type {
  AuditLogEntity,
  AuditLogsEntity,
} from '../../domain/entities/audit-log.entity';
import type {
  AuditLogItemResponseDto,
  AuditLogsResponseDto,
} from '../dtos/audit-log.dto';

class AuditLogMapper {
  toEntity(dto: AuditLogItemResponseDto): AuditLogEntity {
    return {
      id: dto.id,
      timestamp: new Date(dto.timestamp),
      actorId: dto.actorId,
      actorRole: dto.actorRole,
      actionType: dto.actionType,
      targetType: dto.targetType,
      targetId: dto.targetId,
      severity: dto.severity as AuditLogEntity['severity'],
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      metadata: dto.metadata,
      integrityHash: dto.integrityHash,
    };
  }

  toEntityList(dto: AuditLogsResponseDto): AuditLogsEntity {
    return {
      items: dto.items.map((item) => this.toEntity(item)),
      total: dto.total,
    };
  }
}

export default AuditLogMapper;
