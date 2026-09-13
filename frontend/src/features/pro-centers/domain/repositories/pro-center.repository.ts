import type { ProCenterEntity } from '../entities/pro-center.entity';

export interface ProCenterRepository {
  getMine(): Promise<ProCenterEntity[]>;
  delete(id: string): Promise<void>;
}
