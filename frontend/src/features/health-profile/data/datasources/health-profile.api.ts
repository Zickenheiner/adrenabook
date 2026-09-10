import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  HealthProfileRequestDto,
  HealthProfileResponseDto,
} from '../dtos/health-profile.dto';

class HealthProfileApi {
  constructor(
    private readonly baseUrl: string = endpoints.healthProfile.update,
  ) {}

  async update(
    data: HealthProfileRequestDto,
  ): Promise<HealthProfileResponseDto> {
    return request<HealthProfileResponseDto>({
      url: this.baseUrl,
      method: methods.PATCH,
      data,
    });
  }
}

export default HealthProfileApi;
