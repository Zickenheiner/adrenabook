import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICsvImportRepository } from '@features/professional/interfaces/repositories/csv-import.irepository';
import {
  CsvImport,
  CsvImportDocument,
} from '@features/professional/domains/schemas/csv-import.schema';
import { CsvImportEntity } from '@features/professional/domains/entities/csv-import.entity';
import { CsvImportDto } from '@features/professional/domains/dtos/csv-import.dto';
import { CsvImportMapper } from '../mappers/csv-import.mapper';

@Injectable()
export class CsvImportRepository implements ICsvImportRepository {
  constructor(
    @InjectModel(CsvImport.name)
    private readonly csvImportModel: Model<CsvImportDocument>,
    private readonly csvImportMapper: CsvImportMapper,
  ) {}

  async create(
    dto: CsvImportDto,
    professionalId: string,
  ): Promise<CsvImportEntity | null> {
    const document = new this.csvImportModel({
      entityType: dto.entityType,
      fileId: dto.fileId,
      columnMapping: dto.columnMapping,
      dryRun: dto.dryRun,
      professionalId,
      status: 'queued',
      rowsTotal: 0,
      rowsSuccess: 0,
      rowsErrors: 0,
      errors: [],
    });
    const created = await document.save();
    return created ? this.csvImportMapper.toEntity(created) : null;
  }

  async findById(id: string): Promise<CsvImportEntity | null> {
    const doc = await this.csvImportModel.findById(id).exec();
    return doc ? this.csvImportMapper.toEntity(doc) : null;
  }
}
