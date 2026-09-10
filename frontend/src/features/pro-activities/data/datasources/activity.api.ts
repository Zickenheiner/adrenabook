import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  CreateActivityRequestDto,
  ActivityResponseDto,
} from '../dtos/activity.dto';

class ActivityApi {
  constructor(
    private readonly baseUrl: string = endpoints.proActivities.base,
  ) {}

  async getAll(): Promise<ActivityResponseDto[]> {
    return request<ActivityResponseDto[]>({
      url: this.baseUrl,
      method: methods.GET,
    });
  }

  async getById(id: string): Promise<ActivityResponseDto> {
    return request<ActivityResponseDto>({
      url: endpoints.proActivities.byId(id),
      method: methods.GET,
    });
  }

  async create(data: CreateActivityRequestDto): Promise<ActivityResponseDto> {
    return request<ActivityResponseDto>({
      url: this.baseUrl,
      method: methods.POST,
      data,
    });
  }

  async update(
    id: string,
    data: Partial<CreateActivityRequestDto>,
  ): Promise<ActivityResponseDto> {
    return request<ActivityResponseDto>({
      url: endpoints.proActivities.byId(id),
      method: methods.PATCH,
      data,
    });
  }

  async delete(id: string): Promise<void> {
    return request<void>({
      url: endpoints.proActivities.byId(id),
      method: methods.DELETE,
    });
  }
}

export default ActivityApi;
