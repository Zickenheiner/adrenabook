import type { ActivityEntity } from '../entities/activity.entity';
import type {
  CreateActivityRequestDto,
  UpdateActivityRequestDto,
} from '../../data/dtos/activity.dto';

export interface ActivityRepository {
  getAll(centerId: string): Promise<ActivityEntity[]>;
  getById(id: string): Promise<ActivityEntity>;
  create(
    data: CreateActivityRequestDto,
    centerId: string,
  ): Promise<ActivityEntity>;
  update(id: string, data: UpdateActivityRequestDto): Promise<ActivityEntity>;
  delete(id: string): Promise<void>;
}
