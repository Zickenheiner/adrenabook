import { CreateAuditLogDto } from '@features/admin/domains/dtos/audit-log.dto';
import { AuditLogEntity } from '@features/admin/domains/entities/audit-log.entity';

export interface IAuditLogService {
  createLog(dto: CreateAuditLogDto): Promise<AuditLogEntity>;
}
