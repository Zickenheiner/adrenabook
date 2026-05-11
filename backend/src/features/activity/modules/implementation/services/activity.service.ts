import { Inject, Injectable } from '@nestjs/common';
import { IActivityService } from '../../../interfaces/services/activity.iservice';
import { IActivityRepository } from '@features/activity/interfaces/repositories/activity.irepository';
import {
  ActivityDetailResponseDto,
  ActivityResponseDto,
  CreateActivityDto,
  SearchActivitiesQueryDto,
  SearchActivitiesResponseDto,
  UpdateActivityDto,
} from '@features/activity/domains/dtos/activity.dto';
import { ActivityEntity } from '@features/activity/domains/entities/activity.entity';

@Injectable()
export class ActivityService implements IActivityService {
  constructor(
    @Inject('IActivityRepository')
    private readonly activityRepository: IActivityRepository,
  ) {}

  async findAll(): Promise<ActivityEntity[] | null> {
    return this.activityRepository.findAll();
  }

  async findById(id: string): Promise<ActivityEntity | null> {
    return this.activityRepository.findById(id);
  }

  async findDetailById(id: string): Promise<ActivityDetailResponseDto | null> {
    return this.activityRepository.findDetailById(id);
  }

  async findByCenterId(centerId: string): Promise<ActivityEntity[] | null> {
    return this.activityRepository.findByCenterId(centerId);
  }

  async create(
    dto: CreateActivityDto,
    centerId: string,
  ): Promise<ActivityResponseDto | null> {
    const entity = await this.activityRepository.create(dto, centerId);
    if (!entity) return null;
    const response = new ActivityResponseDto();
    response.id = entity.getId();
    response.status = entity.getStatus();
    response.createdAt =
      entity.getCreatedAt()?.toISOString() ?? new Date().toISOString();
    return response;
  }

  async update(id: string, dto: UpdateActivityDto): Promise<boolean> {
    return this.activityRepository.update(id, dto);
  }

  async delete(id: string): Promise<boolean> {
    return this.activityRepository.delete(id);
  }

  async search(
    query: SearchActivitiesQueryDto,
  ): Promise<SearchActivitiesResponseDto> {
    return this.activityRepository.search(query);
  }
}
