import type { SlotRepository } from '../../domain/repositories/slot.repository';
import type {
  CreateSlotsResultEntity,
  ProSlotEntity,
} from '../../domain/entities/slot.entity';
import type { CreateSlotRequestDto } from '../dtos/slot.dto';
import SlotApi from '../datasources/slot.api';
import SlotMapper from '../mappers/slot.mapper';

class SlotRepositoryImpl implements SlotRepository {
  constructor(
    private readonly api: SlotApi = new SlotApi(),
    private readonly mapper: SlotMapper = new SlotMapper(),
  ) {}

  async listSlots(activityId: string): Promise<ProSlotEntity[]> {
    const dtos = await this.api.listSlots(activityId);
    return dtos.map((dto) => this.mapper.toProSlotEntity(dto));
  }

  async createSlots(
    activityId: string,
    data: CreateSlotRequestDto,
  ): Promise<CreateSlotsResultEntity> {
    const dto = await this.api.createSlots(activityId, data);
    return this.mapper.toCreateResultEntity(dto);
  }
}

export default SlotRepositoryImpl;
