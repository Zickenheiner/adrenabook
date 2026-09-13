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
  ActivityMonthSlotsResponseDto,
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

  async isPublicPhoto(fileId: string): Promise<boolean> {
    return this.activityRepository.existsPublishedWithPhoto(fileId);
  }

  async findDetailById(id: string): Promise<ActivityDetailResponseDto | null> {
    return this.activityRepository.findDetailById(id);
  }

  async findSlotsByMonth(
    id: string,
    month: string,
  ): Promise<ActivityMonthSlotsResponseDto | null> {
    return this.activityRepository.findSlotsByMonth(id, month);
  }

  async findByCenterId(centerId: string): Promise<ActivityEntity[] | null> {
    return this.activityRepository.findByCenterId(centerId);
  }

  /**
   * Activites d'un centre, apres verification que le centre appartient bien au
   * professionnel appelant.
   */
  async findMine(
    userId: string,
    centerId: string,
  ): Promise<ActivityEntity[] | null> {
    const owned = await this.ownedCenterIds(userId);
    if (!owned.includes(centerId)) {
      throw new ForbiddenException('Ce centre ne vous appartient pas');
    }
    return this.activityRepository.findByCenterId(centerId);
  }

  /** Identifiants des centres portes par le professionnel appelant. */
  private async ownedCenterIds(userId: string): Promise<string[]> {
    const centers =
      await this.professionalCenterService.findAllByOwnerId(userId);
    return centers.map((center) => center.getId());
  }

  async create(
    dto: CreateActivityDto,
    userId: string,
    centerId?: string,
  ): Promise<ActivityResponseDto | null> {
    // L'activite est rattachee a un centre, pas au compte. Un professionnel
    // pouvant en porter plusieurs, le centre cible est explicite ; a defaut on
    // retombe sur le sien lorsqu'il n'en a qu'un.
    const owned = await this.ownedCenterIds(userId);
    if (owned.length === 0) return null;

    const targetId = centerId ?? (owned.length === 1 ? owned[0] : undefined);
    if (!targetId || !owned.includes(targetId)) return null;

    const entity = await this.activityRepository.create(dto, targetId);
    if (!entity) return null;
    const response = new ActivityResponseDto();
    response.id = entity.getId();
    response.status = entity.getStatus();
    response.createdAt =
      entity.getCreatedAt()?.toISOString() ?? new Date().toISOString();
    return response;
  }

  /**
   * Verifie que l'activite ciblee releve de l'un des centres du professionnel
   * appelant. Sans ce controle, connaitre un identifiant suffit a modifier ou
   * supprimer l'activite d'un concurrent. La comparaison porte sur tous ses
   * centres : n'en retenir qu'un lui fermerait ses propres activites.
   */
  private async assertOwnership(
    activityId: string,
    userId: string,
  ): Promise<void> {
    const activity = await this.activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundException('Activité introuvable');
    }
    const owned = await this.ownedCenterIds(userId);
    if (!owned.includes(activity.getCenterId().toString())) {
      throw new ForbiddenException(
        "Cette activité n'appartient à aucun de vos centres",
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
