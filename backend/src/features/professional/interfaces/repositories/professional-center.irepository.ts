import { OwnedCenterDto } from '@features/professional/domains/dtos/professional-center.dto';
import {
  CreateProfessionalCenterDto,
  UpdateProfessionalCenterDto,
} from '@features/professional/domains/dtos/professional-center.dto';
import { ProfessionalCenterEntity } from '@features/professional/domains/entities/professional-center.entity';

export interface IProfessionalCenterRepository {
  findAll(): Promise<ProfessionalCenterEntity[] | null>;
  findById(id: string): Promise<ProfessionalCenterEntity | null>;
  findByOwnerId(ownerId: string): Promise<ProfessionalCenterEntity | null>;
  /**
   * Tous les centres d'un proprietaire. `findByOwnerId` n'en renvoie qu'un,
   * arbitraire, et ne suffit plus des lors qu'un professionnel en porte
   * plusieurs.
   */
  findAllByOwnerId(ownerId: string): Promise<ProfessionalCenterEntity[]>;
  /** Centres du proprietaire, avec le nombre d'activites de chacun. */
  findOwnedWithActivityCount(ownerId: string): Promise<OwnedCenterDto[]>;
  create(dto: CreateProfessionalCenterDto, ownerId: string): Promise<boolean>;
  update(id: string, dto: UpdateProfessionalCenterDto): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  /** Nombre d'activites rattachees au centre, tous statuts confondus. */
  countActivities(id: string): Promise<number>;
}
