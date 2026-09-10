import type { SlotDetailEntity } from '../entities/slot-detail.entity';

export interface SlotDetailRepository {
  getById(id: string): Promise<SlotDetailEntity>;
}
