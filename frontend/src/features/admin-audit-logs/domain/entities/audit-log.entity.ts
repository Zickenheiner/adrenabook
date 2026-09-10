import type { AuditLogSeverity } from '../../data/dtos/audit-log.dto';

export interface AuditLogEntity {
  id: string;
  timestamp: Date;
  actorId: string;
  actorRole: string;
  actionType: string;
  targetType: string;
  targetId: string;
  severity: AuditLogSeverity;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  integrityHash: string;
}

export interface AuditLogsEntity {
  items: AuditLogEntity[];
  total: number;
}
