import type { SlotRepository } from '../../domain/repositories/slot.repository';
import type {
  CreateSlotsResultEntity,
  ProSlotMonthEntity,
} from '../../domain/entities/slot.entity';
import type {
  UpdateSlotRequestDto,
  CreateSlotRequestDto,
} from '../dtos/slot.dto';
import SlotApi from '../datasources/slot.api';
import SlotMapper from '../mappers/slot.mapper';

class SlotRepositoryImpl implements SlotRepository {
  constructor(
    private readonly api: SlotApi = new SlotApi(),
    private readonly mapper: SlotMapper = new SlotMapper(),
  ) {}

  async listSlots(
    activityId: string,
    month: string,
  ): Promise<ProSlotMonthEntity> {
    const dto = await this.api.listSlots(activityId, month);
    return {
      slots: dto.slots.map((slot) => this.mapper.toProSlotEntity(slot)),
      availableMonths: dto.availableMonths,
    };
  }

  async createSlots(
    activityId: string,
    data: CreateSlotRequestDto,
  ): Promise<CreateSlotsResultEntity> {
    const dto = await this.api.createSlots(activityId, data);
    return this.mapper.toCreateResultEntity(dto);
  }
  async updateSlot(
    activityId: string,
    slotId: string,
    data: UpdateSlotRequestDto,
  ): Promise<boolean> {
    return this.api.updateSlot(activityId, slotId, data);
  }

  async deleteSlot(activityId: string, slotId: string): Promise<boolean> {
    return this.api.deleteSlot(activityId, slotId);
  }
}

export default SlotRepositoryImpl;
