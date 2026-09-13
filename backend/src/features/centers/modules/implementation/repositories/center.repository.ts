import { Injectable } from '@nestjs/common';
import { ICenterRepository } from '../../../interfaces/repositories/center.irepository';
import { Model, PipelineStage, Types } from 'mongoose';
import {
  CentersMapQueryDto,
  CentersQueryDto,
} from '@features/centers/domains/dtos/center.dto';
import { CenterEntity } from '@features/centers/domains/entities/center.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  ProfessionalCenter,
  ProfessionalCenterDocument,
} from '@features/professional/domains/schemas/professional-center.schema';

@Injectable()
export class CenterRepository implements ICenterRepository {
  constructor(
    @InjectModel(ProfessionalCenter.name)
    private readonly professionalCenterModel: Model<ProfessionalCenterDocument>,
  ) {}

  /**
   * Source unique des centres affiches : la collection professionnelle, seule
   * alimentee par le parcours d'inscription. Seuls les centres approuves et
   * geocodes peuvent apparaitre sur la carte.
   */
  private mapPipeline(extraMatch: Record<string, unknown>): PipelineStage[] {
    return [
      {
        $match: {
          status: 'approved',
          'location.lat': { $exists: true },
          ...extraMatch,
        },
      },
      {
        $lookup: {
          from: 'activities',
          localField: '_id',
          foreignField: 'centerId',
          pipeline: [{ $match: { status: 'published' } }],
          as: 'activities',
        },
      },
      {
        $project: {
          _id: 1,
          name: '$companyName',
          lat: '$location.lat',
          lng: '$location.lng',
          city: '$address.city',
          activityTypes: '$activities.type',
          activitiesCount: { $size: '$activities' },
        },
      },
    ];
  }

  private async runMapPipeline(
    extraMatch: Record<string, unknown>,
    activityType?: string,
  ): Promise<CenterEntity[]> {
    const pipeline = this.mapPipeline(extraMatch);

    // Le filtre par type s'applique apres le $lookup, sur les types agreges.
    if (activityType) {
      pipeline.push({ $match: { activityTypes: activityType } });
    }

    const docs = await this.professionalCenterModel
      .aggregate<{
        _id: Types.ObjectId;
        name: string;
        lat: number;
        lng: number;
        city: string;
        activityTypes: string[];
        activitiesCount: number;
      }>(pipeline)
      .exec();

    return docs.map((doc) => {
      const entity = new CenterEntity(doc._id as never);
      entity.setName(doc.name);
      entity.setLat(doc.lat);
      entity.setLng(doc.lng);
      entity.setCity(doc.city ?? '');
      entity.setActivityTypes(doc.activityTypes ?? []);
      entity.setActivitiesCount(doc.activitiesCount ?? 0);
      return entity;
    });
  }

  async findByBbox(query: CentersMapQueryDto): Promise<CenterEntity[] | null> {
    const [minLng, minLat, maxLng, maxLat] = query.bbox.split(',').map(Number);

    return this.runMapPipeline(
      {
        'location.lat': { $exists: true, $gte: minLat, $lte: maxLat },
        'location.lng': { $gte: minLng, $lte: maxLng },
      },
      query.activityType,
    );
  }

  async findByRadius(query: CentersQueryDto): Promise<CenterEntity[] | null> {
    const extraMatch: Record<string, unknown> = {};

    if (
      query.lat !== undefined &&
      query.lng !== undefined &&
      query.radius !== undefined
    ) {
      // Approximate bounding box from radius (1° lat ≈ 111 km)
      const deltaLat = query.radius / 111;
      const deltaLng =
        query.radius / (111 * Math.cos((query.lat * Math.PI) / 180));

      extraMatch['location.lat'] = {
        $exists: true,
        $gte: query.lat - deltaLat,
        $lte: query.lat + deltaLat,
      };
      extraMatch['location.lng'] = {
        $gte: query.lng - deltaLng,
        $lte: query.lng + deltaLng,
      };
    }

    return this.runMapPipeline(extraMatch, query.type);
  }
}
