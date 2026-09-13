import { Injectable } from '@nestjs/common';
import {
  ActivityOwnership,
  ActivityConditions,
  ISlotRepository,
} from '../../../interfaces/repositories/slot.irepository';
import { SlotMapper } from '../mappers/slot.mapper';
import { Slot, SlotDocument } from '@features/slot/domains/schemas/slot.schema';
import {
  Booking,
  BookingDocument,
} from '@features/booking/domains/schemas/booking.schema';
import {
  Activity,
  ActivityDocument,
} from '@features/activity/domains/schemas/activity.schema';
import {
  ProfessionalCenter,
  ProfessionalCenterDocument,
} from '@features/professional/domains/schemas/professional-center.schema';
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
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
    @InjectModel(ProfessionalCenter.name)
    private readonly centerModel: Model<ProfessionalCenterDocument>,
    private readonly slotMapper: SlotMapper,
  ) {}

  async findById(id: string): Promise<SlotEntity | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const slot = await this.slotModel.findById(id).exec();
    return slot ? this.slotMapper.toEntity(slot) : null;
  }

  async countActiveBookings(slotId: string): Promise<number> {
    return this.bookingModel
      .countDocuments({
        slotId: new mongoose.Types.ObjectId(slotId),
        status: { $ne: 'cancelled' },
      })
      .exec();
  }

  async findByActivityId(activityId: string): Promise<SlotEntity[] | null> {
    const slots = await this.slotModel.find({ activityId }).exec();
    return slots ? slots.map((doc) => this.slotMapper.toEntity(doc)) : null;
  }

  async findByActivityIdAndMonth(
    activityId: string,
    month: string,
  ): Promise<SlotEntity[]> {
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return [];
    }

    const [year, monthIndex] = month.split('-').map(Number);
    const monthStart = new Date(Date.UTC(year, monthIndex - 1, 1));
    const monthEnd = new Date(Date.UTC(year, monthIndex, 1));

    const slots = await this.slotModel
      .find({
        activityId: new mongoose.Types.ObjectId(activityId),
        startAt: { $gte: monthStart, $lt: monthEnd },
      })
      .sort({ startAt: 1 })
      .exec();

    return slots.map((doc) => this.slotMapper.toEntity(doc));
  }

  async findMonthsWithSlots(activityId: string): Promise<string[]> {
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return [];
    }

    // Passe inclus : le professionnel consulte aussi l'historique de son
    // activite, contrairement au visiteur qui ne peut reserver qu'a venir.
    const months = await this.slotModel.aggregate<{ _id: string }>([
      { $match: { activityId: new mongoose.Types.ObjectId(activityId) } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$startAt' } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return months.map((m) => m._id);
  }

  async findActivityOwnership(
    activityId: string,
  ): Promise<ActivityOwnership | null> {
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return null;
    }

    const activity = await this.activityModel
      .findById(activityId)
      .select('centerId')
      .exec();
    if (!activity) {
      return null;
    }

    const center = await this.centerModel
      .findById(activity.centerId)
      .select('ownerId')
      .exec();

    return { ownerId: center ? center.ownerId.toString() : null };
  }

  async findActivityConditions(
    activityId: string,
  ): Promise<ActivityConditions | null> {
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return null;
    }

    const activity = await this.activityModel
      .findById(activityId)
      .select('durationMinutes priceEur prerequisites')
      .exec();
    if (!activity) {
      return null;
    }

    return {
      durationMinutes: activity.durationMinutes,
      priceEur: activity.priceEur,
      prerequisites: activity.prerequisites,
    };
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
          maxParticipants: dto.maxParticipants,
          instructorIds: dto.instructorIds,
          recurrence: dto.recurrence,
        }),
    );

    const saved = await Promise.all(documents.map((doc) => doc.save()));
    return saved.map((doc) => this.slotMapper.toEntity(doc));
  }
}
