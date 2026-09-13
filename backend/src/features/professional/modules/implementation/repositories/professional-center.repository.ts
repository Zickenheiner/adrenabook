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
import { OwnedCenterDto } from '@features/professional/domains/dtos/professional-center.dto';
import { InjectModel } from '@nestjs/mongoose';
import { GeocodingService } from '../services/geocoding.service';

@Injectable()
export class ProfessionalCenterRepository
  implements IProfessionalCenterRepository
{
  constructor(
    @InjectModel(ProfessionalCenter.name)
    private readonly professionalCenterModel: Model<ProfessionalCenterDocument>,
    private readonly professionalCenterMapper: ProfessionalCenterMapper,
    private readonly geocodingService: GeocodingService,
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

  async findOwnedWithActivityCount(ownerId: string): Promise<OwnedCenterDto[]> {
    if (!Types.ObjectId.isValid(ownerId)) return [];

    return this.professionalCenterModel
      .aggregate<OwnedCenterDto>([
        { $match: { ownerId: new Types.ObjectId(ownerId) } },
        { $sort: { createdAt: 1 } },
        {
          $lookup: {
            from: 'activities',
            localField: '_id',
            foreignField: 'centerId',
            as: 'activities',
          },
        },
        {
          $project: {
            _id: 0,
            id: { $toString: '$_id' },
            companyName: 1,
            status: 1,
            address: 1,
            activitiesCount: { $size: '$activities' },
          },
        },
      ])
      .exec();
  }

  async countActivities(id: string): Promise<number> {
    if (!Types.ObjectId.isValid(id)) return 0;
    return this.professionalCenterModel.db
      .collection('activities')
      .countDocuments({ centerId: new Types.ObjectId(id) });
  }

  async findAllByOwnerId(ownerId: string): Promise<ProfessionalCenterEntity[]> {
    if (!Types.ObjectId.isValid(ownerId)) {
      return [];
    }
    const docs = await this.professionalCenterModel
      .find({ ownerId: new Types.ObjectId(ownerId) })
      .sort({ createdAt: 1 })
      .exec();
    return docs.map((doc) => this.professionalCenterMapper.toEntity(doc));
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
    // Localise le centre des l'inscription : la carte n'affiche que les centres
    // geocodes. En echec, geocode() renvoie null et l'inscription se poursuit.
    const location = await this.geocodingService.geocode({
      street: dto.address.street,
      postalCode: dto.address.postalCode,
      city: dto.address.city,
    });

    const document = new this.professionalCenterModel({
      ...dto,
      ownerId: new Types.ObjectId(ownerId),
      ...(location ? { location } : {}),
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
    // Une adresse modifiee sans regeocodage laisserait le centre epingle a son
    // ancienne position sur la carte.
    const location = dto.address
      ? await this.geocodingService.geocode({
          street: dto.address.street,
          postalCode: dto.address.postalCode,
          city: dto.address.city,
        })
      : null;

    const updated = await this.professionalCenterModel
      .findByIdAndUpdate(
        id,
        { ...dto, ...(location ? { location } : {}) },
        { new: true },
      )
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
