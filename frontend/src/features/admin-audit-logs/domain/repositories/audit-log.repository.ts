import type { AuditLogsEntity } from '../entities/audit-log.entity';
import type { AuditLogsQueryDto } from '../../data/dtos/audit-log.dto';

export interface AuditLogRepository {
  getAll(query?: AuditLogsQueryDto): Promise<AuditLogsEntity>;
}
