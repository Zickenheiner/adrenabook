import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  CsvImportRequestDto,
  CsvImportResponseDto,
} from '../dtos/csv-import.dto';

class CsvImportApi {
  constructor(private readonly baseUrl: string = endpoints.proImport.csv) {}

  async import(data: CsvImportRequestDto): Promise<CsvImportResponseDto> {
    return request<CsvImportResponseDto>({
      url: this.baseUrl,
      method: methods.POST,
      data,
    });
  }
}

export default CsvImportApi;
