import { Injectable } from '@nestjs/common';
import { SensitiveActionLogEntity } from '@features/admin/domains/entities/sensitive-action-log.entity';
import { SensitiveActionLogDocument } from '@features/admin/domains/schemas/sensitive-action-log.schema';

@Injectable()
export class SensitiveActionLogMapper {
  toEntity(doc: SensitiveActionLogDocument): SensitiveActionLogEntity {
    const entity = new SensitiveActionLogEntity(doc._id);
    entity.setActorId(doc.actorId);
    entity.setActorRole(doc.actorRole);
    entity.setActionType(doc.actionType);
    entity.setTargetType(doc.targetType);
    entity.setTargetId(doc.targetId);
    entity.setSeverity(doc.severity);
    entity.setIpAddress(doc.ipAddress);
    entity.setUserAgent(doc.userAgent);
    entity.setMetadata(doc.metadata);
    entity.setIntegrityHash(doc.integrityHash);
    const docWithTimestamps = doc as SensitiveActionLogDocument & {
      createdAt?: Date;
    };
    entity.setTimestamp(docWithTimestamps.createdAt ?? new Date());
    return entity;
  }
}
