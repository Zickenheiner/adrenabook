import type { CsvImportRepository } from '../../domain/repositories/csv-import.repository';
import type { CsvImportEntity } from '../../domain/entities/csv-import.entity';
import type { CsvImportRequestDto } from '../dtos/csv-import.dto';
import CsvImportApi from '../datasources/csv-import.api';
import CsvImportMapper from '../mappers/csv-import.mapper';

class CsvImportRepositoryImpl implements CsvImportRepository {
  constructor(
    private readonly api: CsvImportApi = new CsvImportApi(),
    private readonly mapper: CsvImportMapper = new CsvImportMapper(),
  ) {}

  async import(data: CsvImportRequestDto): Promise<CsvImportEntity> {
    const dto = await this.api.import(data);
    return this.mapper.toEntity(dto);
  }
}

export default CsvImportRepositoryImpl;
