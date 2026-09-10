import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  NotificationPreferencesRequestDto,
  NotificationPreferencesResponseDto,
} from '../dtos/notification-preferences.dto';

class NotificationPreferencesApi {
  constructor(
    private readonly baseUrl: string = endpoints.notificationPreferences.update,
  ) {}

  async update(
    data: NotificationPreferencesRequestDto,
  ): Promise<NotificationPreferencesResponseDto> {
    return request<NotificationPreferencesResponseDto>({
      url: this.baseUrl,
      method: methods.PATCH,
      data,
    });
  }
}

export default NotificationPreferencesApi;
