import type { NotificationPreferencesRepository } from '../../domain/repositories/notification-preferences.repository';
import type { NotificationPreferencesEntity } from '../../domain/entities/notification-preferences.entity';
import type { NotificationPreferencesRequestDto } from '../dtos/notification-preferences.dto';
import NotificationPreferencesApi from '../datasources/notification-preferences.api';
import NotificationPreferencesMapper from '../mappers/notification-preferences.mapper';

class NotificationPreferencesRepositoryImpl implements NotificationPreferencesRepository {
  constructor(
    private readonly api: NotificationPreferencesApi = new NotificationPreferencesApi(),
    private readonly mapper: NotificationPreferencesMapper = new NotificationPreferencesMapper(),
  ) {}

  async update(
    data: NotificationPreferencesRequestDto,
  ): Promise<NotificationPreferencesEntity> {
    const dto = await this.api.update(data);
    return this.mapper.toEntity(dto);
  }
}

export default NotificationPreferencesRepositoryImpl;
