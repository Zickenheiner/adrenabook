import type { CsvImportEntity } from '../../domain/entities/csv-import.entity';
import type { CsvImportResponseDto } from '../dtos/csv-import.dto';

class CsvImportMapper {
  toEntity(dto: CsvImportResponseDto): CsvImportEntity {
    return {
      importJobId: dto.importJobId,
      status: dto.status,
      rowsTotal: dto.rowsTotal,
      rowsSuccess: dto.rowsSuccess,
      rowsErrors: dto.rowsErrors,
      errors: dto.errors,
    };
  }
}

export default CsvImportMapper;
