import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICenterReviewRepository } from '../../../interfaces/repositories/center-review.irepository';
import {
  CenterReview,
  CenterReviewDocument,
} from '@features/admin/domains/schemas/center-review.schema';
import { CenterReviewEntity } from '@features/admin/domains/entities/center-review.entity';
import { ReviewCenterDto } from '@features/admin/domains/dtos/center-review.dto';
import { CenterReviewMapper } from '../mappers/center-review.mapper';

@Injectable()
export class CenterReviewRepository implements ICenterReviewRepository {
  constructor(
    @InjectModel(CenterReview.name)
    private readonly centerReviewModel: Model<CenterReviewDocument>,
    private readonly centerReviewMapper: CenterReviewMapper,
  ) {}

  async findAll(): Promise<CenterReviewEntity[] | null> {
    const docs = await this.centerReviewModel.find().exec();
    return docs ? docs.map((d) => this.centerReviewMapper.toEntity(d)) : null;
  }

  async findById(id: string): Promise<CenterReviewEntity | null> {
    const doc = await this.centerReviewModel.findById(id).exec();
    return doc ? this.centerReviewMapper.toEntity(doc) : null;
  }

  async create(dto: ReviewCenterDto): Promise<CenterReviewEntity> {
    const document = new this.centerReviewModel(dto);
    const saved = await document.save();
    return this.centerReviewMapper.toEntity(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.centerReviewModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
