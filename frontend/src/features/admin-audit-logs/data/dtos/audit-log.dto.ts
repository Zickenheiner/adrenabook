export type AuditLogActionType =
  | 'auth.login'
  | 'auth.login_failed'
  | 'user.status_changed'
  | 'center.reviewed'
  | 'data.deleted'
  | 'payment.refunded';

export type AuditLogSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogsQueryDto {
  actorId?: string;
  actionType?: AuditLogActionType;
  from?: string;
  to?: string;
  severity?: AuditLogSeverity;
  page?: number;
  pageSize?: number;
}

export interface AuditLogItemResponseDto {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: string;
  actionType: string;
  targetType: string;
  targetId: string;
  severity: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  integrityHash: string;
}

export interface AuditLogsResponseDto {
  items: AuditLogItemResponseDto[];
  total: number;
}
