import {
  CenterDetailResponseDto,
  CentersMapQueryDto,
  CentersQueryDto,
} from '@features/centers/domains/dtos/center.dto';
import { CenterEntity } from '@features/centers/domains/entities/center.entity';

/**
 * Les centres affiches sur la carte proviennent de la collection
 * professionnelle : leur cycle de vie (creation, mise a jour, suppression)
 * appartient a la feature `professional`, pas a cette lecture.
 */
export interface ICenterRepository {
  findByBbox(query: CentersMapQueryDto): Promise<CenterEntity[] | null>;
  findByRadius(query: CentersQueryDto): Promise<CenterEntity[] | null>;
  /** Fiche publique d'un centre approuve, avec ses activites publiees. */
  findDetailById(id: string): Promise<CenterDetailResponseDto | null>;
}
