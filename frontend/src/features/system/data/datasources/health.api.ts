import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type { HealthCheckResponseDto } from '../dtos/health.dto';

class HealthApi {
  constructor(private readonly baseUrl: string = endpoints.system.health) {}

  async getHealth(): Promise<HealthCheckResponseDto> {
    return request<HealthCheckResponseDto>({
      url: this.baseUrl,
      method: methods.GET,
    });
  }
}

export default HealthApi;
