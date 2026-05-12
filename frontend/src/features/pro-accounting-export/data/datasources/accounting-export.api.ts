import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  AccountingExportRequestDto,
  AccountingExportResponseDto,
} from '../dtos/accounting-export.dto';

class AccountingExportApi {
  constructor(
    private readonly baseUrl: string = endpoints.proAccountingExport.create,
  ) {}

  async create(
    data: AccountingExportRequestDto,
  ): Promise<AccountingExportResponseDto> {
    return request<AccountingExportResponseDto>({
      url: this.baseUrl,
      method: methods.POST,
      data,
    });
  }
}

export default AccountingExportApi;
