import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  ActivityResponseDto,
  CreateActivityRequestDto,
  UpdateActivityRequestDto,
} from '../dtos/activity.dto';

class ActivityApi {
  /**
   * Activites d'un centre. `this.baseUrl` listerait celles de toute la
   * plateforme : c'est l'endpoint d'administration.
   */
  async getAll(centerId: string): Promise<ActivityResponseDto[]> {
    return request<ActivityResponseDto[]>({
      url: endpoints.proActivities.mine(centerId),
      method: methods.GET,
    });
  }

  async getById(id: string): Promise<ActivityResponseDto> {
    return request<ActivityResponseDto>({
      url: endpoints.proActivities.byId(id),
      method: methods.GET,
    });
  }

  async create(
    data: CreateActivityRequestDto,
    centerId: string,
  ): Promise<ActivityResponseDto> {
    return request<ActivityResponseDto>({
      url: endpoints.proActivities.createIn(centerId),
      method: methods.POST,
      data,
    });
  }

  async update(
    id: string,
    data: UpdateActivityRequestDto,
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
