import {
  ActivityDetailResponseDto,
  ActivityResponseDto,
  CreateActivityDto,
  SearchActivitiesQueryDto,
  SearchActivitiesResponseDto,
  UpdateActivityDto,
} from '@features/activity/domains/dtos/activity.dto';
import { ActivityEntity } from '@features/activity/domains/entities/activity.entity';

export interface IActivityService {
  findAll(): Promise<ActivityEntity[] | null>;
  findById(id: string): Promise<ActivityEntity | null>;
  findDetailById(id: string): Promise<ActivityDetailResponseDto | null>;
  findByCenterId(centerId: string): Promise<ActivityEntity[] | null>;
  create(
    dto: CreateActivityDto,
    userId: string,
  ): Promise<ActivityResponseDto | null>;
  update(id: string, dto: UpdateActivityDto): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  search(query: SearchActivitiesQueryDto): Promise<SearchActivitiesResponseDto>;
}
