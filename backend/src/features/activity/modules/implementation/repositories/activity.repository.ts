import { Injectable } from '@nestjs/common';
import { IActivityRepository } from '../../../interfaces/repositories/activity.irepository';
import { ActivityMapper } from '../mappers/activity.mapper';
import {
  Activity,
  ActivityDocument,
} from '@features/activity/domains/schemas/activity.schema';
import { Model } from 'mongoose';
import {
  CreateActivityDto,
  UpdateActivityDto,
} from '@features/activity/domains/dtos/activity.dto';
import { ActivityEntity } from '@features/activity/domains/entities/activity.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ActivityRepository implements IActivityRepository {
  constructor(
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
    private readonly activityMapper: ActivityMapper,
  ) {}

  async findAll(): Promise<ActivityEntity[] | null> {
    const activities = await this.activityModel.find().exec();
    return activities
      ? activities.map((doc) => this.activityMapper.toEntity(doc))
      : null;
  }

  async findById(id: string): Promise<ActivityEntity | null> {
    const activity = await this.activityModel.findById(id).exec();
    return activity ? this.activityMapper.toEntity(activity) : null;
  }

  async findByCenterId(centerId: string): Promise<ActivityEntity[] | null> {
    const activities = await this.activityModel.find({ centerId }).exec();
    return activities
      ? activities.map((doc) => this.activityMapper.toEntity(doc))
      : null;
  }

  async create(
    dto: CreateActivityDto,
    centerId: string,
  ): Promise<ActivityEntity | null> {
    const document = new this.activityModel({ ...dto, centerId });
    const created = await document.save();
    return created ? this.activityMapper.toEntity(created) : null;
  }

  async update(id: string, dto: UpdateActivityDto): Promise<boolean> {
    const updated = await this.activityModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    return !!updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.activityModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
