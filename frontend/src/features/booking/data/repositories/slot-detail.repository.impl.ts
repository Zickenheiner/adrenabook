import type { SlotDetailRepository } from '../../domain/repositories/slot-detail.repository';
import type { SlotDetailEntity } from '../../domain/entities/slot-detail.entity';
import SlotDetailApi from '../datasources/slot-detail.api';
import SlotDetailMapper from '../mappers/slot-detail.mapper';

class SlotDetailRepositoryImpl implements SlotDetailRepository {
  constructor(
    private readonly api: SlotDetailApi = new SlotDetailApi(),
    private readonly mapper: SlotDetailMapper = new SlotDetailMapper(),
  ) {}

  async getById(id: string): Promise<SlotDetailEntity> {
    const dto = await this.api.getById(id);
    return this.mapper.toEntity(dto);
  }
}

export default SlotDetailRepositoryImpl;
