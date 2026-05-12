import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';
import type { AuditLogsEntity } from '../../domain/entities/audit-log.entity';
import type { AuditLogsQueryDto } from '../dtos/audit-log.dto';
import AuditLogApi from '../datasources/audit-log.api';
import AuditLogMapper from '../mappers/audit-log.mapper';

class AuditLogRepositoryImpl implements AuditLogRepository {
  constructor(
    private readonly api: AuditLogApi = new AuditLogApi(),
    private readonly mapper: AuditLogMapper = new AuditLogMapper(),
  ) {}

  async getAll(query?: AuditLogsQueryDto): Promise<AuditLogsEntity> {
    const dto = await this.api.getAll(query);
    return this.mapper.toEntityList(dto);
  }
}

export default AuditLogRepositoryImpl;
