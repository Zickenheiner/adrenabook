import { OwnedCenterDto } from '@features/professional/domains/dtos/professional-center.dto';
import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IProfessionalCenterService } from '../../../interfaces/services/professional-center.iservice';
import { IProfessionalCenterRepository } from '@features/professional/interfaces/repositories/professional-center.irepository';
import {
  CreateProfessionalCenterDto,
  UpdateProfessionalCenterDto,
} from '@features/professional/domains/dtos/professional-center.dto';
import { ProfessionalCenterEntity } from '@features/professional/domains/entities/professional-center.entity';

@Injectable()
export class ProfessionalCenterService implements IProfessionalCenterService {
  constructor(
    @Inject('IProfessionalCenterRepository')
    private readonly professionalCenterRepository: IProfessionalCenterRepository,
  ) {}

  async findAll(): Promise<ProfessionalCenterEntity[] | null> {
    return this.professionalCenterRepository.findAll();
  }

  async findById(id: string): Promise<ProfessionalCenterEntity | null> {
    return this.professionalCenterRepository.findById(id);
  }

  async findOwnedWithActivityCount(ownerId: string): Promise<OwnedCenterDto[]> {
    return this.professionalCenterRepository.findOwnedWithActivityCount(
      ownerId,
    );
  }

  async findAllByOwnerId(ownerId: string): Promise<ProfessionalCenterEntity[]> {
    return this.professionalCenterRepository.findAllByOwnerId(ownerId);
  }

  async findByOwnerId(
    ownerId: string,
  ): Promise<ProfessionalCenterEntity | null> {
    return this.professionalCenterRepository.findByOwnerId(ownerId);
  }

  async create(
    dto: CreateProfessionalCenterDto,
    ownerId: string,
  ): Promise<boolean> {
    return this.professionalCenterRepository.create(dto, ownerId);
  }

  async update(
    id: string,
    dto: UpdateProfessionalCenterDto,
    userId: string,
  ): Promise<boolean> {
    await this.assertOwnership(id, userId);
    return this.professionalCenterRepository.update(id, dto);
  }

  /**
   * Un centre n'est modifiable et supprimable que par celui qui l'a declare.
   */
  private async assertOwnership(id: string, userId: string): Promise<void> {
    const center = await this.professionalCenterRepository.findById(id);
    if (!center) {
      throw new NotFoundException('Centre introuvable');
    }
    if (center.getOwnerId().toString() !== userId) {
      throw new ForbiddenException('Ce centre ne vous appartient pas');
    }
  }

  async delete(id: string, userId: string): Promise<boolean> {
    await this.assertOwnership(id, userId);

    // Supprimer un centre laisserait ses activites sans rattachement, et avec
    // elles les creneaux et reservations qui en dependent.
    const activities =
      await this.professionalCenterRepository.countActivities(id);
    if (activities > 0) {
      throw new ConflictException(
        'Supprimez d’abord les activités de ce centre.',
      );
    }

    return this.professionalCenterRepository.delete(id);
  }
}
