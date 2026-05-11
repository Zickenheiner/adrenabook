import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  CentersMapQueryDto,
  CentersMapResponseDto,
} from '../dtos/center-map.dto';

class CenterMapApi {
  constructor(private readonly baseUrl: string = endpoints.centerMap.map) {}

  async getMap(query: CentersMapQueryDto): Promise<CentersMapResponseDto> {
    return request<CentersMapResponseDto>({
      url: this.baseUrl,
      method: methods.GET,
      query: {
        bbox: query.bbox,
        zoom: query.zoom,
        ...(query.activityType ? { activityType: query.activityType } : {}),
      },
    });
  }
}

export default CenterMapApi;
