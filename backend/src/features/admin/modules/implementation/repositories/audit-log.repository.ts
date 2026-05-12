import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAuditLogRepository } from '../../../interfaces/repositories/audit-log.irepository';
import {
  AuditLog,
  AuditLogDocument,
} from '@features/admin/domains/schemas/audit-log.schema';
import { AuditLogEntity } from '@features/admin/domains/entities/audit-log.entity';
import {
  CreateAuditLogDto,
  UpdateAuditLogDto,
} from '@features/admin/domains/dtos/audit-log.dto';
import { AuditLogMapper } from '../mappers/audit-log.mapper';

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
    private readonly auditLogMapper: AuditLogMapper,
  ) {}

  async findAll(): Promise<AuditLogEntity[] | null> {
    const docs = await this.auditLogModel.find().exec();
    return docs ? docs.map((doc) => this.auditLogMapper.toEntity(doc)) : null;
  }

  async findById(id: string): Promise<AuditLogEntity | null> {
    const doc = await this.auditLogModel.findById(id).exec();
    return doc ? this.auditLogMapper.toEntity(doc) : null;
  }

  async create(dto: CreateAuditLogDto): Promise<AuditLogEntity> {
    const document = new this.auditLogModel(dto);
    const created = await document.save();
    return this.auditLogMapper.toEntity(created);
  }

  async update(id: string, dto: UpdateAuditLogDto): Promise<boolean> {
    const updated = await this.auditLogModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    return !!updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.auditLogModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
