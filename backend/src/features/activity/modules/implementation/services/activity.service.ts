import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { IProfessionalCenterService } from '@features/professional/interfaces/services/professional-center.iservice';

@Injectable()
export class ActivityService implements IActivityService {
  constructor(
    @Inject('IActivityRepository')
    private readonly activityRepository: IActivityRepository,
    @Inject('IProfessionalCenterService')
    private readonly professionalCenterService: IProfessionalCenterService,
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
    userId: string,
  ): Promise<ActivityResponseDto | null> {
    // L'activite est rattachee au centre du professionnel, pas a son compte
    const center = await this.professionalCenterService.findByOwnerId(userId);
    if (!center) return null;

    const entity = await this.activityRepository.create(dto, center.getId());
    if (!entity) return null;
    const response = new ActivityResponseDto();
    response.id = entity.getId();
    response.status = entity.getStatus();
    response.createdAt =
      entity.getCreatedAt()?.toISOString() ?? new Date().toISOString();
    return response;
  }

  /**
   * Verifie que l'activite ciblee appartient bien au centre du professionnel
   * appelant. Sans ce controle, connaitre un identifiant suffit a modifier ou
   * supprimer l'activite d'un concurrent.
   */
  private async assertOwnership(
    activityId: string,
    userId: string,
  ): Promise<void> {
    const activity = await this.activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundException('Activité introuvable');
    }
    const center = await this.professionalCenterService.findByOwnerId(userId);
    if (!center || activity.getCenterId().toString() !== center.getId()) {
      throw new ForbiddenException(
        "Cette activité n'appartient pas à votre centre",
      );
    }
  }

  async update(
    id: string,
    dto: UpdateActivityDto,
    userId: string,
  ): Promise<boolean> {
    await this.assertOwnership(id, userId);
    return this.activityRepository.update(id, dto);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    await this.assertOwnership(id, userId);
    return this.activityRepository.delete(id);
  }

  async search(
    query: SearchActivitiesQueryDto,
  ): Promise<SearchActivitiesResponseDto> {
    return this.activityRepository.search(query);
  }
}
