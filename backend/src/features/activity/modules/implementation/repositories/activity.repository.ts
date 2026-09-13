import { Injectable } from '@nestjs/common';
import { IActivityRepository } from '../../../interfaces/repositories/activity.irepository';
import { ActivityMapper } from '../mappers/activity.mapper';
import {
  Activity,
  ActivityDocument,
} from '@features/activity/domains/schemas/activity.schema';
import { Slot, SlotDocument } from '@features/slot/domains/schemas/slot.schema';
import { Model, PipelineStage, Types } from 'mongoose';
import {
  ActivityDetailResponseDto,
  ActivityMonthSlotsResponseDto,
  NewActivityData,
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
  priceEur: number;
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
}

@Injectable()
export class ActivityRepository implements IActivityRepository {
  constructor(
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
    @InjectModel(Slot.name)
    private readonly slotModel: Model<SlotDocument>,
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

  /**
   * Une photo n'est servie publiquement que si une activite publiee la
   * reference : les autres fichiers du depot (justificatifs KYC) restent
   * inaccessibles sans authentification.
   */
  async existsPublishedWithPhoto(fileId: string): Promise<boolean> {
    const count = await this.activityModel
      .countDocuments({ status: 'published', photoFileIds: fileId })
      .exec();
    return count > 0;
  }

  async findDetailById(id: string): Promise<ActivityDetailResponseDto | null> {
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
    dto.priceEur = doc.priceEur;
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
    data: NewActivityData,
    centerId: string,
  ): Promise<ActivityEntity | null> {
    const document = new this.activityModel({ ...data, centerId });
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

  /**
   * Encadrement lat/lng deduit du rayon, comme pour la carte : un degre de
   * latitude vaut environ 111 km, et un degre de longitude se resserre vers
   * les poles d'un facteur cos(latitude).
   */
  private radiusFilter(
    lat: number,
    lng: number,
    radiusKm: number,
  ): Record<string, { $gte: number; $lte: number }> {
    const deltaLat = radiusKm / 111;
    const deltaLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    return {
      'center.location.lat': { $gte: lat - deltaLat, $lte: lat + deltaLat },
      'center.location.lng': { $gte: lng - deltaLng, $lte: lng + deltaLng },
    };
  }

  /**
   * Distance equirectangulaire en kilometres. L'approximation suffit pour
   * ordonner des resultats a l'echelle d'une region, sans imposer d'index
   * geospatial ni de migration du champ location en GeoJSON.
   */
  private distanceExpression(
    lat: number,
    lng: number,
  ): Record<string, unknown> {
    return {
      $let: {
        vars: {
          dLat: { $subtract: ['$center.location.lat', lat] },
          dLng: {
            $multiply: [
              { $subtract: ['$center.location.lng', lng] },
              { $cos: { $degreesToRadians: lat } },
            ],
          },
        },
        in: {
          $multiply: [
            111.32,
            {
              $sqrt: {
                $add: [{ $pow: ['$$dLat', 2] }, { $pow: ['$$dLng', 2] }],
              },
            },
          ],
        },
      },
    };
  }

  /**
   * Creneaux d'un mois donne, et mois a venir qui en comportent.
   *
   * Charger un mois a la fois evite d'envoyer une annee de creneaux pour une
   * recurrence longue ; `availableMonths` evite en retour de naviguer a
   * l'aveugle de mois en mois.
   *
   * @param month mois vise au format YYYY-MM
   */
  async findSlotsByMonth(
    id: string,
    month: string,
  ): Promise<ActivityMonthSlotsResponseDto | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const activity = await this.activityModel
      .findOne({ _id: id, status: 'published' })
      .select('priceEur')
      .exec();
    if (!activity) {
      return null;
    }

    const activityId = new Types.ObjectId(id);
    const now = new Date();
    const [year, monthIndex] = month.split('-').map(Number);
    const monthStart = new Date(Date.UTC(year, monthIndex - 1, 1));
    const monthEnd = new Date(Date.UTC(year, monthIndex, 1));

    // Un mois deja entame ne doit pas proposer ses dates passees.
    const from = monthStart > now ? monthStart : now;

    const [docs, months] = await Promise.all([
      this.slotModel
        .find({ activityId, startAt: { $gte: from, $lt: monthEnd } })
        .sort({ startAt: 1 })
        .exec(),
      this.slotModel.aggregate<{ _id: string }>([
        { $match: { activityId, startAt: { $gte: now } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$startAt' },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const response = new ActivityMonthSlotsResponseDto();
    response.slots = docs.map((slot) => ({
      id: String(slot._id),
      startAt: slot.startAt.toISOString(),
      remainingSeats: slot.maxParticipants,
      priceEur: activity.priceEur,
    }));
    response.availableMonths = months.map((m) => m._id);
    return response;
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
      matchFilter['priceEur'] = priceFilter;
    }
    if (query.query) {
      matchFilter['$text'] = { $search: query.query };
    }

    // Position et rayon repondent a deux besoins distincts : la position seule
    // suffit a classer du plus proche au plus loin, le rayon s'y ajoute pour
    // restreindre la zone. Les lier obligerait a borner la recherche pour
    // pouvoir la trier.
    const hasPosition = query.lat !== undefined && query.lng !== undefined;
    const hasRadius = hasPosition && query.radiusKm !== undefined;

    let sortField: string;
    let sortOrder: 1 | -1;
    if (query.sortBy === 'price_asc') {
      sortField = 'priceEur';
      sortOrder = 1;
    } else if (query.sortBy === 'price_desc') {
      sortField = 'priceEur';
      sortOrder = -1;
    } else if (query.sortBy === 'distance' && hasPosition) {
      sortField = 'distanceKm';
      sortOrder = 1;
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
    ];

    if (hasRadius) {
      // Les coordonnees sont portees par le centre : le filtre ne peut donc
      // s'appliquer qu'apres la jointure.
      pipeline.push({
        $match: this.radiusFilter(query.lat!, query.lng!, query.radiusKm!),
      });
    }

    if (hasPosition) {
      pipeline.push({
        $addFields: {
          distanceKm: this.distanceExpression(query.lat!, query.lng!),
        },
      });
    }

    pipeline.push({ $sort: { [sortField]: sortOrder } });

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
          priceEur: 1,
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
        priceEur: number;
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
      item.priceEur = doc.priceEur;
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
