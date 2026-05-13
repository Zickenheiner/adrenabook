import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  CentersMapQueryDto,
  CentersMapResponseDto,
} from '../dtos/center-map.dto';

class CenterMapApi {
  constructor(private readonly baseUrl: string = endpoints.centerMap.list) {}

  async getMap(query: CentersMapQueryDto): Promise<CentersMapResponseDto> {
    const params: Record<string, string | number> = {};
    if (query.lat !== undefined) params.lat = query.lat;
    if (query.lng !== undefined) params.lng = query.lng;
    if (query.radius !== undefined) params.radius = query.radius;
    if (query.type) params.type = query.type;

    return request<CentersMapResponseDto>({
      url: this.baseUrl,
      method: methods.GET,
      query: params,
    });
  }
}

export default CenterMapApi;
