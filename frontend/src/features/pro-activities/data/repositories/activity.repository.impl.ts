import type { ActivityRepository } from '../../domain/repositories/activity.repository';
import type { ActivityEntity } from '../../domain/entities/activity.entity';
import type {
  CreateActivityRequestDto,
  UpdateActivityRequestDto,
} from '../dtos/activity.dto';
import ActivityApi from '../datasources/activity.api';
import ActivityMapper from '../mappers/activity.mapper';

class ActivityRepositoryImpl implements ActivityRepository {
  constructor(
    private readonly api: ActivityApi = new ActivityApi(),
    private readonly mapper: ActivityMapper = new ActivityMapper(),
  ) {}

  async getAll(centerId: string): Promise<ActivityEntity[]> {
    const dtos = await this.api.getAll(centerId);
    return this.mapper.toEntityList(dtos);
  }

  async getById(id: string): Promise<ActivityEntity> {
    const dto = await this.api.getById(id);
    return this.mapper.toEntity(dto);
  }

  async create(
    data: CreateActivityRequestDto,
    centerId: string,
  ): Promise<ActivityEntity> {
    const dto = await this.api.create(data, centerId);
    return this.mapper.toEntity(dto);
  }

  async update(
    id: string,
    data: UpdateActivityRequestDto,
  ): Promise<ActivityEntity> {
    const dto = await this.api.update(id, data);
    return this.mapper.toEntity(dto);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(id);
  }
}

export default ActivityRepositoryImpl;
