import { Inject, Injectable } from '@nestjs/common';
import { IProfessionalCenterService } from '../../../interfaces/services/professional-center.iservice';
import { IProfessionalCenterRepository } from '@features/professional/interfaces/repositories/professional-center.irepository';
import {
  CreateProfessionalCenterDto,
  UpdateProfessionalCenterDto,
} from '@features/professional/domains/dtos/professional-center.dto';
import { ProfessionalCenterEntity } from '@features/professional/domains/entities/professional-center.entity';

@Injectable()
export class ProfessionalCenterService implements IProfessionalCenterService {
  constructor(
    @Inject('IProfessionalCenterRepository')
    private readonly professionalCenterRepository: IProfessionalCenterRepository,
  ) {}

  async findAll(): Promise<ProfessionalCenterEntity[] | null> {
    return this.professionalCenterRepository.findAll();
  }

  async findById(id: string): Promise<ProfessionalCenterEntity | null> {
    return this.professionalCenterRepository.findById(id);
  }

  async findByOwnerId(
    ownerId: string,
  ): Promise<ProfessionalCenterEntity | null> {
    return this.professionalCenterRepository.findByOwnerId(ownerId);
  }

  async create(
    dto: CreateProfessionalCenterDto,
    ownerId: string,
  ): Promise<boolean> {
    return this.professionalCenterRepository.create(dto, ownerId);
  }

  async update(id: string, dto: UpdateProfessionalCenterDto): Promise<boolean> {
    return this.professionalCenterRepository.update(id, dto);
  }

  async delete(id: string): Promise<boolean> {
    return this.professionalCenterRepository.delete(id);
  }
}
