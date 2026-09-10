import { CsvImportDto } from '@features/professional/domains/dtos/csv-import.dto';
import { CsvImportEntity } from '@features/professional/domains/entities/csv-import.entity';

export interface ICsvImportRepository {
  create(
    dto: CsvImportDto,
    professionalId: string,
  ): Promise<CsvImportEntity | null>;
  findById(id: string): Promise<CsvImportEntity | null>;
}
