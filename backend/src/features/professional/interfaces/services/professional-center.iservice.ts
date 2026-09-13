import { OwnedCenterDto } from '@features/professional/domains/dtos/professional-center.dto';
import {
  CreateProfessionalCenterDto,
  UpdateProfessionalCenterDto,
} from '@features/professional/domains/dtos/professional-center.dto';
import { ProfessionalCenterEntity } from '@features/professional/domains/entities/professional-center.entity';

export interface IProfessionalCenterService {
  findAll(): Promise<ProfessionalCenterEntity[] | null>;
  findById(id: string): Promise<ProfessionalCenterEntity | null>;
  findByOwnerId(ownerId: string): Promise<ProfessionalCenterEntity | null>;
  /**
   * Tous les centres d'un proprietaire. `findByOwnerId` n'en renvoie qu'un,
   * arbitraire, et ne suffit plus des lors qu'un professionnel en porte
   * plusieurs.
   */
  findAllByOwnerId(ownerId: string): Promise<ProfessionalCenterEntity[]>;
  findOwnedWithActivityCount(ownerId: string): Promise<OwnedCenterDto[]>;
  create(dto: CreateProfessionalCenterDto, ownerId: string): Promise<boolean>;
  update(
    id: string,
    dto: UpdateProfessionalCenterDto,
    userId: string,
  ): Promise<boolean>;
  /**
   * `userId` sert au controle de propriete : un centre n'est supprimable que
   * par celui qui l'a declare.
   */
  delete(id: string, userId: string): Promise<boolean>;
}
