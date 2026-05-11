import { Injectable } from '@nestjs/common';
import { ISlotRepository } from '../../../interfaces/repositories/slot.irepository';
import { SlotMapper } from '../mappers/slot.mapper';
import { Slot, SlotDocument } from '@features/slot/domains/schemas/slot.schema';
import { Model } from 'mongoose';
import { CreateSlotsDto } from '@features/slot/domains/dtos/slot.dto';
import { SlotEntity } from '@features/slot/domains/entities/slot.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Injectable()
export class SlotRepository implements ISlotRepository {
  constructor(
    @InjectModel(Slot.name)
    private readonly slotModel: Model<SlotDocument>,
    private readonly slotMapper: SlotMapper,
  ) {}

  async findByActivityId(activityId: string): Promise<SlotEntity[] | null> {
    const slots = await this.slotModel.find({ activityId }).exec();
    return slots ? slots.map((doc) => this.slotMapper.toEntity(doc)) : null;
  }

  async createMany(
    activityId: string,
    dto: CreateSlotsDto,
    startDates: Date[],
  ): Promise<SlotEntity[]> {
    const documents = startDates.map(
      (startAt) =>
        new this.slotModel({
          activityId: new mongoose.Types.ObjectId(activityId),
          startAt,
          durationMinutes: dto.durationMinutes,
          maxParticipants: dto.maxParticipants,
          priceEur: dto.priceEur,
          instructorIds: dto.instructorIds,
          recurrence: dto.recurrence,
        }),
    );

    const saved = await Promise.all(documents.map((doc) => doc.save()));
    return saved.map((doc) => this.slotMapper.toEntity(doc));
  }
}
