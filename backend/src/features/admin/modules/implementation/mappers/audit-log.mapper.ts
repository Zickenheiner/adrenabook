import { AuditLogEntity } from '@features/admin/domains/entities/audit-log.entity';
import { AuditLogDocument } from '@features/admin/domains/schemas/audit-log.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditLogMapper {
  toEntity(doc: AuditLogDocument): AuditLogEntity {
    const entity = new AuditLogEntity(doc._id);
    entity.setTargetUserId(doc.targetUserId);
    entity.setAdminId(doc.adminId);
    entity.setPreviousStatus(doc.previousStatus);
    entity.setNewStatus(doc.newStatus);
    entity.setReason(doc.reason);
    entity.setDurationDays(doc.durationDays);
    entity.setEffectiveUntil(doc.effectiveUntil);
    return entity;
  }
}
