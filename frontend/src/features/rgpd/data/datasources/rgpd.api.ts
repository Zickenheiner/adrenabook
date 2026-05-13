import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  RgpdDeleteRequestDto,
  RgpdDeleteResponseDto,
  RgpdExportResponseDto,
} from '../dtos/rgpd.dto';

class RgpdApi {
  async requestExport(): Promise<RgpdExportResponseDto> {
    return request<RgpdExportResponseDto>({
      url: endpoints.rgpd.export,
      method: methods.POST,
    });
  }

  async requestDelete(
    data: RgpdDeleteRequestDto,
  ): Promise<RgpdDeleteResponseDto> {
    return request<RgpdDeleteResponseDto>({
      url: endpoints.rgpd.delete,
      method: methods.POST,
      data,
    });
  }
}

export default RgpdApi;
