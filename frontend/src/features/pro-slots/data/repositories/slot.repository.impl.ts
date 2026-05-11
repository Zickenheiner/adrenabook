import type { SlotRepository } from '../../domain/repositories/slot.repository';
import type { CreateSlotsResultEntity } from '../../domain/entities/slot.entity';
import type { CreateSlotRequestDto } from '../dtos/slot.dto';
import SlotApi from '../datasources/slot.api';
import SlotMapper from '../mappers/slot.mapper';

class SlotRepositoryImpl implements SlotRepository {
  constructor(
    private readonly api: SlotApi = new SlotApi(),
    private readonly mapper: SlotMapper = new SlotMapper(),
  ) {}

  async createSlots(
    activityId: string,
    data: CreateSlotRequestDto,
  ): Promise<CreateSlotsResultEntity> {
    const dto = await this.api.createSlots(activityId, data);
    return this.mapper.toCreateResultEntity(dto);
  }
}

export default SlotRepositoryImpl;
