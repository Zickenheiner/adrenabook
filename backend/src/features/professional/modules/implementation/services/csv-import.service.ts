import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ICsvImportService } from '@features/professional/interfaces/services/csv-import.iservice';
import { ICsvImportRepository } from '@features/professional/interfaces/repositories/csv-import.irepository';
import {
  CsvImportDto,
  CsvImportResponseDto,
} from '@features/professional/domains/dtos/csv-import.dto';

@Injectable()
export class CsvImportService implements ICsvImportService {
  constructor(
    @Inject('ICsvImportRepository')
    private readonly csvImportRepository: ICsvImportRepository,
  ) {}

  async importCsv(
    dto: CsvImportDto,
    professionalId: string,
  ): Promise<CsvImportResponseDto> {
    if (!dto.columnMapping || Object.keys(dto.columnMapping).length === 0) {
      throw new BadRequestException(
        'Column mapping is required and cannot be empty',
      );
    }

    const importJob = await this.csvImportRepository.create(
      dto,
      professionalId,
    );

    if (!importJob) {
      throw new BadRequestException('Failed to create import job');
    }

    return {
      importJobId: importJob.getId(),
      status: importJob.getStatus() as
        | 'queued'
        | 'processing'
        | 'completed'
        | 'failed',
      rowsTotal: importJob.getRowsTotal(),
      rowsSuccess: importJob.getRowsSuccess(),
      rowsErrors: importJob.getRowsErrors(),
      errors: importJob.getErrors(),
    };
  }
}
