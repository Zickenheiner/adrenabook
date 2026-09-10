import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { IAccountingExportRepository } from '../../../interfaces/repositories/accounting-export.irepository';
import {
  AccountingExport,
  AccountingExportDocument,
} from '@features/professional/domains/schemas/accounting-export.schema';
import { AccountingExportEntity } from '@features/professional/domains/entities/accounting-export.entity';
import { CreateAccountingExportDto } from '@features/professional/domains/dtos/accounting-export.dto';
import { AccountingExportMapper } from '../mappers/accounting-export.mapper';

@Injectable()
export class AccountingExportRepository implements IAccountingExportRepository {
  constructor(
    @InjectModel(AccountingExport.name)
    private readonly accountingExportModel: Model<AccountingExportDocument>,
    private readonly accountingExportMapper: AccountingExportMapper,
  ) {}

  async create(
    dto: CreateAccountingExportDto,
    professionalId: string,
  ): Promise<AccountingExportEntity> {
    const document = new this.accountingExportModel({
      format: dto.format,
      from: new Date(dto.from),
      to: new Date(dto.to),
      includeRefunds: dto.includeRefunds,
      deliveryMode: dto.deliveryMode,
      status: 'queued',
      recordsCount: 0,
      professionalId: new mongoose.Types.ObjectId(professionalId),
    });
    const saved = await document.save();
    return this.accountingExportMapper.toEntity(
      saved as AccountingExportDocument,
    );
  }

  async findById(id: string): Promise<AccountingExportEntity | null> {
    const doc = await this.accountingExportModel.findById(id).exec();
    return doc ? this.accountingExportMapper.toEntity(doc) : null;
  }
}
