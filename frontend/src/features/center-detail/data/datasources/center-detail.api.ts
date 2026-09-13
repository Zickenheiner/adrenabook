import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type { CenterDetailResponseDto } from '../dtos/center-detail.dto';

class CenterDetailApi {
  async getById(id: string): Promise<CenterDetailResponseDto> {
    return request<CenterDetailResponseDto>({
      url: endpoints.centers.byId(id),
      method: methods.GET,
    });
  }
}

export default CenterDetailApi;
