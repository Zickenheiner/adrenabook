import type { CenterDetailEntity } from '../entities/center-detail.entity';

export interface CenterDetailRepository {
  getById(id: string): Promise<CenterDetailEntity>;
}
