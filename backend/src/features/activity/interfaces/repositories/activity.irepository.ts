import {
  CreateActivityDto,
  UpdateActivityDto,
} from '@features/activity/domains/dtos/activity.dto';
import { ActivityEntity } from '@features/activity/domains/entities/activity.entity';

export interface IActivityRepository {
  findAll(): Promise<ActivityEntity[] | null>;
  findById(id: string): Promise<ActivityEntity | null>;
  findByCenterId(centerId: string): Promise<ActivityEntity[] | null>;
  create(
    dto: CreateActivityDto,
    centerId: string,
  ): Promise<ActivityEntity | null>;
  update(id: string, dto: UpdateActivityDto): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
