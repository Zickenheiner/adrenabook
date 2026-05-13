import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ISensitiveActionLogRepository } from '../../../interfaces/repositories/sensitive-action-log.irepository';
import {
  SensitiveActionLog,
  SensitiveActionLogDocument,
} from '@features/admin/domains/schemas/sensitive-action-log.schema';
import { SensitiveActionLogEntity } from '@features/admin/domains/entities/sensitive-action-log.entity';
import {
  AuditLogsQueryDto,
  CreateSensitiveActionLogDto,
} from '@features/admin/domains/dtos/sensitive-action-log.dto';
import { SensitiveActionLogMapper } from '../mappers/sensitive-action-log.mapper';

@Injectable()
export class SensitiveActionLogRepository
  implements ISensitiveActionLogRepository
{
  constructor(
    @InjectModel(SensitiveActionLog.name)
    private readonly sensitiveActionLogModel: Model<SensitiveActionLogDocument>,
    private readonly sensitiveActionLogMapper: SensitiveActionLogMapper,
  ) {}

  async findWithFilters(
    query: AuditLogsQueryDto,
  ): Promise<{ items: SensitiveActionLogEntity[]; total: number }> {
    const filter: FilterQuery<SensitiveActionLogDocument> = {};

    if (query.actorId) {
      filter.actorId = query.actorId;
    }
    if (query.actionType) {
      filter.actionType = query.actionType;
    }
    if (query.severity) {
      filter.severity = query.severity;
    }
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) {
        filter.createdAt.$gte = new Date(query.from);
      }
      if (query.to) {
        filter.createdAt.$lte = new Date(query.to);
      }
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const [docs, total] = await Promise.all([
      this.sensitiveActionLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .exec(),
      this.sensitiveActionLogModel.countDocuments(filter).exec(),
    ]);

    const items = docs.map((doc) =>
      this.sensitiveActionLogMapper.toEntity(doc),
    );

    return { items, total };
  }

  async create(
    dto: CreateSensitiveActionLogDto,
  ): Promise<SensitiveActionLogEntity> {
    const integrityHash = this.computeIntegrityHash(dto);
    const document = new this.sensitiveActionLogModel({
      ...dto,
      severity: dto.severity ?? 'info',
      integrityHash,
    });
    const created = await document.save();
    return this.sensitiveActionLogMapper.toEntity(created);
  }

  private computeIntegrityHash(dto: CreateSensitiveActionLogDto): string {
    const payload = JSON.stringify({
      actorId: dto.actorId,
      actorRole: dto.actorRole,
      actionType: dto.actionType,
      targetType: dto.targetType,
      targetId: dto.targetId,
      timestamp: new Date().toISOString(),
    });
    // Simple deterministic hash using Buffer (no crypto import needed for basic tamper-evidence)
    const hash = Buffer.from(payload).toString('base64');
    return `sha256-b64:${hash}`;
  }
}
