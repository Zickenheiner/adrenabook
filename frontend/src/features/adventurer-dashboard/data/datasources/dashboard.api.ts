import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type { DashboardResponseDto } from '../dtos/dashboard.dto';

class DashboardApi {
  constructor(
    private readonly baseUrl: string = endpoints.adventurerDashboard.get,
  ) {}

  async getDashboard(): Promise<DashboardResponseDto> {
    return request<DashboardResponseDto>({
      url: this.baseUrl,
      method: methods.GET,
    });
  }
}

export default DashboardApi;
