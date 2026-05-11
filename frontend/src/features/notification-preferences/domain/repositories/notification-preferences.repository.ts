import type { NotificationPreferencesEntity } from '../entities/notification-preferences.entity';
import type { NotificationPreferencesRequestDto } from '../../data/dtos/notification-preferences.dto';

export interface NotificationPreferencesRepository {
  update(
    data: NotificationPreferencesRequestDto,
  ): Promise<NotificationPreferencesEntity>;
}
