import {
  ActivityMonthSlotsResponseDto,
  ActivityDetailResponseDto,
  NewActivityData,
  SearchActivitiesQueryDto,
  SearchActivitiesResponseDto,
  UpdateActivityDto,
} from '@features/activity/domains/dtos/activity.dto';
import { ActivityEntity } from '@features/activity/domains/entities/activity.entity';

export interface IActivityRepository {
  findAll(): Promise<ActivityEntity[] | null>;
  findById(id: string): Promise<ActivityEntity | null>;
  /** Une photo n'est publiquement lisible que si une activite publiee la porte. */
  existsPublishedWithPhoto(fileId: string): Promise<boolean>;
  findDetailById(id: string): Promise<ActivityDetailResponseDto | null>;
  /** null si l'activite n'existe pas ou n'est pas publiee */
  findSlotsByMonth(
    id: string,
    month: string,
  ): Promise<ActivityMonthSlotsResponseDto | null>;
  findByCenterId(centerId: string): Promise<ActivityEntity[] | null>;
  create(
    data: NewActivityData,
    centerId: string,
  ): Promise<ActivityEntity | null>;
  update(id: string, dto: UpdateActivityDto): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  search(query: SearchActivitiesQueryDto): Promise<SearchActivitiesResponseDto>;
}
