import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  DashboardQueryDto,
  DashboardResponseDto,
} from '../dtos/dashboard.dto';

class DashboardApi {
  constructor(private readonly baseUrl: string = endpoints.proDashboard.get) {}

  async get(query: DashboardQueryDto): Promise<DashboardResponseDto> {
    const params = new URLSearchParams();
    params.set('range', query.range);
    if (query.from) params.set('from', query.from);
    if (query.to) params.set('to', query.to);

    return request<DashboardResponseDto>({
      url: `${this.baseUrl}?${params.toString()}`,
      method: methods.GET,
    });
  }
}

export default DashboardApi;
