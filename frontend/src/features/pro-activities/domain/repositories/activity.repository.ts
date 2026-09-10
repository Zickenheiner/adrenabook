import type { ActivityEntity } from '../entities/activity.entity';
import type { CreateActivityRequestDto } from '../../data/dtos/activity.dto';

export interface ActivityRepository {
  getAll(): Promise<ActivityEntity[]>;
  getById(id: string): Promise<ActivityEntity>;
  create(data: CreateActivityRequestDto): Promise<ActivityEntity>;
  update(
    id: string,
    data: Partial<CreateActivityRequestDto>,
  ): Promise<ActivityEntity>;
  delete(id: string): Promise<void>;
}
