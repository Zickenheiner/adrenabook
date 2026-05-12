import {
  CsvImportDto,
  CsvImportResponseDto,
} from '@features/professional/domains/dtos/csv-import.dto';

export interface ICsvImportService {
  importCsv(
    dto: CsvImportDto,
    professionalId: string,
  ): Promise<CsvImportResponseDto>;
}
