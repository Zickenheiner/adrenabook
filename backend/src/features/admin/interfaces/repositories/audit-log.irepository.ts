import {
  CreateAuditLogDto,
  UpdateAuditLogDto,
} from '@features/admin/domains/dtos/audit-log.dto';
import { AuditLogEntity } from '@features/admin/domains/entities/audit-log.entity';

export interface IAuditLogRepository {
  findAll(): Promise<AuditLogEntity[] | null>;
  findById(id: string): Promise<AuditLogEntity | null>;
  create(dto: CreateAuditLogDto): Promise<AuditLogEntity>;
  update(id: string, dto: UpdateAuditLogDto): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
