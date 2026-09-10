import type { CsvImportEntity } from '../entities/csv-import.entity';
import type { CsvImportRequestDto } from '../../data/dtos/csv-import.dto';

export interface CsvImportRepository {
  import(data: CsvImportRequestDto): Promise<CsvImportEntity>;
}
