import { ConflictException, Injectable } from '@nestjs/common';
import { IProfessionalCenterRepository } from '../../../interfaces/repositories/professional-center.irepository';
import { ProfessionalCenterMapper } from '../mappers/professional-center.mapper';
import {
  ProfessionalCenter,
  ProfessionalCenterDocument,
} from '@features/professional/domains/schemas/professional-center.schema';
import { Model, Types } from 'mongoose';
import {
  CreateProfessionalCenterDto,
  UpdateProfessionalCenterDto,
} from '@features/professional/domains/dtos/professional-center.dto';
import { ProfessionalCenterEntity } from '@features/professional/domains/entities/professional-center.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProfessionalCenterRepository implements IProfessionalCenterRepository {
  constructor(
    @InjectModel(ProfessionalCenter.name)
    private readonly professionalCenterModel: Model<ProfessionalCenterDocument>,
    private readonly professionalCenterMapper: ProfessionalCenterMapper,
  ) {}

  async findAll(): Promise<ProfessionalCenterEntity[] | null> {
    const docs = await this.professionalCenterModel.find().exec();
    return docs
      ? docs.map((d) => this.professionalCenterMapper.toEntity(d))
      : null;
  }

  async findById(id: string): Promise<ProfessionalCenterEntity | null> {
    const doc = await this.professionalCenterModel.findById(id).exec();
    return doc ? this.professionalCenterMapper.toEntity(doc) : null;
  }

  async findByOwnerId(
    ownerId: string,
  ): Promise<ProfessionalCenterEntity | null> {
    if (!Types.ObjectId.isValid(ownerId)) {
      return null;
    }
    const doc = await this.professionalCenterModel
      .findOne({ ownerId: new Types.ObjectId(ownerId) })
      .exec();
    return doc ? this.professionalCenterMapper.toEntity(doc) : null;
  }

  async create(
    dto: CreateProfessionalCenterDto,
    ownerId: string,
  ): Promise<boolean> {
    const document = new this.professionalCenterModel({
      ...dto,
      ownerId: new Types.ObjectId(ownerId),
    });

    try {
      const created = await document.save();
      return !!created;
    } catch (error) {
      // Le SIRET porte un index unique : un centre deja enregistre est une
      // situation utilisateur normale, pas une panne. Sans ce traitement,
      // MongoDB fait remonter un E11000 en 500.
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException(
          'Un centre est déjà enregistré avec ce numéro SIRET.',
        );
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateProfessionalCenterDto): Promise<boolean> {
    const updated = await this.professionalCenterModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    return !!updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.professionalCenterModel
      .findByIdAndDelete(id)
      .exec();
    return !!result;
  }
}
