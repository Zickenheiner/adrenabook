import { Inject, Injectable } from '@nestjs/common';
import { IAuditLogService } from '../../../interfaces/services/audit-log.iservice';
import { IAuditLogRepository } from '@features/admin/interfaces/repositories/audit-log.irepository';
import { CreateAuditLogDto } from '@features/admin/domains/dtos/audit-log.dto';
import { AuditLogEntity } from '@features/admin/domains/entities/audit-log.entity';

@Injectable()
export class AuditLogService implements IAuditLogService {
  constructor(
    @Inject('IAuditLogRepository')
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async createLog(dto: CreateAuditLogDto): Promise<AuditLogEntity> {
    return this.auditLogRepository.create(dto);
  }
}
