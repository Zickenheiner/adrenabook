import { AuditLogsQueryDto } from '@features/admin/domains/dtos/sensitive-action-log.dto';
import { SensitiveActionLogEntity } from '@features/admin/domains/entities/sensitive-action-log.entity';
import { CreateSensitiveActionLogDto } from '@features/admin/domains/dtos/sensitive-action-log.dto';

export interface ISensitiveActionLogRepository {
  findWithFilters(
    query: AuditLogsQueryDto,
  ): Promise<{ items: SensitiveActionLogEntity[]; total: number }>;
  create(dto: CreateSensitiveActionLogDto): Promise<SensitiveActionLogEntity>;
}
