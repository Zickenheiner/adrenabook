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

  async delete(id: string): Promise<void> {
    await request<void>({
      url: endpoints.professionalCenter.byId(id),
      method: methods.DELETE,
    });
  }
}

export default ProCenterApi;
