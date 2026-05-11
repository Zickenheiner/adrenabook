import type { NotificationPreferencesEntity } from '../../domain/entities/notification-preferences.entity';
import type { NotificationPreferencesResponseDto } from '../dtos/notification-preferences.dto';

class NotificationPreferencesMapper {
  toEntity(
    dto: NotificationPreferencesResponseDto,
  ): NotificationPreferencesEntity {
    return {
      updated: dto.updated,
      email: {
        bookingConfirmation: dto.preferences.email.bookingConfirmation,
        reminders: dto.preferences.email.reminders,
        marketing: dto.preferences.email.marketing,
      },
      sms: {
        bookingConfirmation: dto.preferences.sms.bookingConfirmation,
        reminders: dto.preferences.sms.reminders,
      },
    };
  }
}

export default NotificationPreferencesMapper;
