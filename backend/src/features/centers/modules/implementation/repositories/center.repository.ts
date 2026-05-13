import { Injectable } from '@nestjs/common';
import { ICenterRepository } from '../../../interfaces/repositories/center.irepository';
import { CenterMapper } from '../mappers/center.mapper';
import {
  Center,
  CenterDocument,
} from '@features/centers/domains/schemas/center.schema';
import { Model } from 'mongoose';
import {
  CentersMapQueryDto,
  CentersQueryDto,
  CreateCenterDto,
  UpdateCenterDto,
} from '@features/centers/domains/dtos/center.dto';
import { CenterEntity } from '@features/centers/domains/entities/center.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CenterRepository implements ICenterRepository {
  constructor(
    @InjectModel(Center.name)
    private readonly centerModel: Model<CenterDocument>,
    private readonly centerMapper: CenterMapper,
  ) {}

  async findAll(): Promise<CenterEntity[] | null> {
    const centers = await this.centerModel.find().exec();
    return centers
      ? centers.map((doc) => this.centerMapper.toEntity(doc))
      : null;
  }

  async findById(id: string): Promise<CenterEntity | null> {
    const center = await this.centerModel.findById(id).exec();
    return center ? this.centerMapper.toEntity(center) : null;
  }

  async create(dto: CreateCenterDto): Promise<boolean> {
    const document = new this.centerModel(dto);
    const createdCenter = await document.save();
    return !!createdCenter;
  }

  async update(id: string, dto: UpdateCenterDto): Promise<boolean> {
    const updatedCenter = await this.centerModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    return !!updatedCenter;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.centerModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async findByBbox(query: CentersMapQueryDto): Promise<CenterEntity[] | null> {
    const [minLng, minLat, maxLng, maxLat] = query.bbox.split(',').map(Number);

    const filter: Record<string, unknown> = {
      lat: { $gte: minLat, $lte: maxLat },
      lng: { $gte: minLng, $lte: maxLng },
    };

    if (query.activityType) {
      filter.activityTypes = query.activityType;
    }

    const centers = await this.centerModel.find(filter).exec();
    return centers
      ? centers.map((doc) => this.centerMapper.toEntity(doc))
      : null;
  }

  async findByRadius(query: CentersQueryDto): Promise<CenterEntity[] | null> {
    const filter: Record<string, unknown> = {};

    if (
      query.lat !== undefined &&
      query.lng !== undefined &&
      query.radius !== undefined
    ) {
      // Approximate bounding box from radius (1° lat ≈ 111 km)
      const deltaLat = query.radius / 111;
      const deltaLng =
        query.radius / (111 * Math.cos((query.lat * Math.PI) / 180));

      filter.lat = {
        $gte: query.lat - deltaLat,
        $lte: query.lat + deltaLat,
      };
      filter.lng = {
        $gte: query.lng - deltaLng,
        $lte: query.lng + deltaLng,
      };
    }

    if (query.type) {
      filter.activityTypes = query.type;
    }

    const centers = await this.centerModel.find(filter).exec();
    return centers
      ? centers.map((doc) => this.centerMapper.toEntity(doc))
      : null;
  }
}
