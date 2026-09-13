import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type { ProCenterResponseDto } from '../dtos/pro-center.dto';

class ProCenterApi {
  async getMine(): Promise<ProCenterResponseDto[]> {
    return request<ProCenterResponseDto[]>({
      url: endpoints.professionalCenter.mine,
      method: methods.GET,
    });
  }
}

export default ProCenterApi;
