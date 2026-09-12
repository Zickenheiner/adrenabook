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
  /**
   * `userId` sert au controle de propriete : une activite n'est modifiable que
   * par le professionnel dont le centre la porte.
   */
  update(id: string, dto: UpdateActivityDto, userId: string): Promise<boolean>;
  delete(id: string, userId: string): Promise<boolean>;
  search(query: SearchActivitiesQueryDto): Promise<SearchActivitiesResponseDto>;
}
