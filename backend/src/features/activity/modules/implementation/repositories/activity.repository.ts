import { Injectable } from '@nestjs/common';
import { IActivityRepository } from '../../../interfaces/repositories/activity.irepository';
import { ActivityMapper } from '../mappers/activity.mapper';
import {
  Activity,
  ActivityDocument,
} from '@features/activity/domains/schemas/activity.schema';
import { Model, PipelineStage, Types } from 'mongoose';
import {
  ActivityDetailResponseDto,
  CreateActivityDto,
  SearchActivitiesItemDto,
  SearchActivitiesQueryDto,
  SearchActivitiesResponseDto,
  UpdateActivityDto,
} from '@features/activity/domains/dtos/activity.dto';
import { ActivityEntity } from '@features/activity/domains/entities/activity.entity';
import { InjectModel } from '@nestjs/mongoose';

interface ActivityDetailAggregationResult {
  _id: Types.ObjectId;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  durationMinutes: number;
  priceFromEur: number;
  prerequisites: {
    minAge: number;
    maxAge?: number;
    minWeightKg?: number;
    maxWeightKg?: number;
    medicalCertificateRequired: boolean;
  };
  includedEquipment: string[];
  photoFileIds: string[];
  status: string;
  center?: {
    _id: Types.ObjectId;
    companyName: string;
    address?: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };
  upcomingSlots: Array<{
    _id: Types.ObjectId;
    startAt: Date;
    maxParticipants: number;
    priceEur: number;
  }>;
}

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

  async findDetailById(id: string): Promise<ActivityDetailResponseDto | null> {
    const now = new Date();
    const ninetyDaysLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    let objectId: Types.ObjectId;
    try {
      objectId = new Types.ObjectId(id);
    } catch {
      return null;
    }

    const pipeline: PipelineStage[] = [
      { $match: { _id: objectId, status: 'published' } },
      {
        $lookup: {
          from: 'professionalcenters',
          localField: 'centerId',
          foreignField: '_id',
          as: 'centerArray',
        },
      },
      {
        $addFields: {
          center: { $arrayElemAt: ['$centerArray', 0] },
        },
      },
      {
        $lookup: {
          from: 'slots',
          let: { actId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$activityId', '$$actId'] },
                startAt: { $gte: now, $lte: ninetyDaysLater },
              },
            },
            { $sort: { startAt: 1 } },
            { $limit: 50 },
          ],
          as: 'upcomingSlots',
        },
      },
      {
        $project: {
          centerArray: 0,
        },
      },
    ];

    const results =
      await this.activityModel.aggregate<ActivityDetailAggregationResult>(
        pipeline,
      );

    if (!results || results.length === 0) {
      return null;
    }

    const doc = results[0];

    const dto = new ActivityDetailResponseDto();
    dto.id = doc._id.toString();
    dto.title = doc.title;
    dto.description = doc.description;
    dto.type = doc.type;
    dto.difficulty = doc.difficulty;
    dto.durationMinutes = doc.durationMinutes;
    dto.priceFromEur = doc.priceFromEur;
    dto.prerequisites = doc.prerequisites;
    dto.includedEquipment = doc.includedEquipment ?? [];

    dto.photos = (doc.photoFileIds ?? []).map((fileId, index) => ({
      url: fileId,
      alt: `${doc.title} - photo ${index + 1}`,
    }));

    dto.videos = [];

    if (doc.center) {
      const addr = doc.center.address;
      const addressStr = addr
        ? `${addr.street}, ${addr.postalCode} ${addr.city}, ${addr.country}`
        : '';
      dto.center = {
        id: doc.center._id.toString(),
        name: doc.center.companyName,
        location: {
          lat: 0,
          lng: 0,
          address: addressStr,
        },
      };
    } else {
      dto.center = {
        id: '',
        name: '',
        location: { lat: 0, lng: 0, address: '' },
      };
    }

    dto.upcomingSlots = (doc.upcomingSlots ?? []).map((slot) => ({
      id: slot._id.toString(),
      startAt:
        slot.startAt instanceof Date
          ? slot.startAt.toISOString()
          : String(slot.startAt),
      remainingSeats: slot.maxParticipants,
      priceEur: slot.priceEur,
    }));

    dto.reviewsSummary = {
      count: 0,
      averageRating: 0,
    };

    return dto;
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

  async search(
    query: SearchActivitiesQueryDto,
  ): Promise<SearchActivitiesResponseDto> {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 50);
    const skip = (page - 1) * pageSize;

    const matchFilter: Record<string, unknown> = { status: 'published' };

    if (query.type) {
      matchFilter['type'] = query.type;
    }
    if (query.difficulty) {
      matchFilter['difficulty'] = query.difficulty;
    }
    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (query.priceMin !== undefined) priceFilter['$gte'] = query.priceMin;
      if (query.priceMax !== undefined) priceFilter['$lte'] = query.priceMax;
      matchFilter['priceFromEur'] = priceFilter;
    }
    if (query.query) {
      matchFilter['$text'] = { $search: query.query };
    }

    let sortField: string;
    let sortOrder: 1 | -1;
    if (query.sortBy === 'price_asc') {
      sortField = 'priceFromEur';
      sortOrder = 1;
    } else if (query.sortBy === 'price_desc') {
      sortField = 'priceFromEur';
      sortOrder = -1;
    } else {
      sortField = '_id';
      sortOrder = -1;
    }

    const pipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'professionalcenters',
          localField: 'centerId',
          foreignField: '_id',
          as: 'center',
        },
      },
      { $unwind: { path: '$center', preserveNullAndEmptyArrays: true } },
      { $sort: { [sortField]: sortOrder } },
    ];

    const countPipeline: PipelineStage[] = [...pipeline, { $count: 'total' }];
    const dataPipeline: PipelineStage[] = [
      ...pipeline,
      { $skip: skip },
      { $limit: pageSize },
      {
        $project: {
          _id: 1,
          title: 1,
          type: 1,
          priceFromEur: 1,
          durationMinutes: 1,
          difficulty: 1,
          centerName: '$center.companyName',
          coverPhotoUrl: { $arrayElemAt: ['$photoFileIds', 0] },
        },
      },
    ];

    const [countResult, docs] = await Promise.all([
      this.activityModel.aggregate(countPipeline).exec(),
      this.activityModel.aggregate(dataPipeline).exec(),
    ]);

    const total: number =
      countResult.length > 0 ? (countResult[0] as { total: number }).total : 0;

    const items: SearchActivitiesItemDto[] = (
      docs as Array<{
        _id: unknown;
        title: string;
        type: string;
        priceFromEur: number;
        durationMinutes: number;
        difficulty: string;
        centerName: string;
        coverPhotoUrl: string;
      }>
    ).map((doc) => {
      const item = new SearchActivitiesItemDto();
      item.id = String(doc._id);
      item.title = doc.title;
      item.type = doc.type;
      item.priceFromEur = doc.priceFromEur;
      item.durationMinutes = doc.durationMinutes;
      item.difficulty = doc.difficulty;
      item.centerName = doc.centerName ?? '';
      item.coverPhotoUrl = doc.coverPhotoUrl ?? '';
      return item;
    });

    const response = new SearchActivitiesResponseDto();
    response.items = items;
    response.total = total;
    response.page = page;
    response.pageSize = pageSize;
    return response;
  }
}
