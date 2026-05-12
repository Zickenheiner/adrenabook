import {
  AuditLogsQueryDto,
  AuditLogsResponseDto,
  CreateSensitiveActionLogDto,
} from '@features/admin/domains/dtos/sensitive-action-log.dto';
import { SensitiveActionLogEntity } from '@features/admin/domains/entities/sensitive-action-log.entity';

export interface ISensitiveActionLogService {
  findAuditLogs(query: AuditLogsQueryDto): Promise<AuditLogsResponseDto>;
  createLog(
    dto: CreateSensitiveActionLogDto,
  ): Promise<SensitiveActionLogEntity>;
}
