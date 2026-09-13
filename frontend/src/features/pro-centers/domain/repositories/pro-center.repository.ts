import type { UpdateCenterRequestDto } from '../../data/dtos/pro-center.dto';
import type { ProCenterEntity } from '../entities/pro-center.entity';

export interface ProCenterRepository {
  getMine(): Promise<ProCenterEntity[]>;
  update(id: string, data: UpdateCenterRequestDto): Promise<void>;
  delete(id: string): Promise<void>;
}
