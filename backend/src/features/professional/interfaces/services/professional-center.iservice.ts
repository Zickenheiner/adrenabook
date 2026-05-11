import {
  CreateProfessionalCenterDto,
  UpdateProfessionalCenterDto,
} from '@features/professional/domains/dtos/professional-center.dto';
import { ProfessionalCenterEntity } from '@features/professional/domains/entities/professional-center.entity';

export interface IProfessionalCenterService {
  findAll(): Promise<ProfessionalCenterEntity[] | null>;
  findById(id: string): Promise<ProfessionalCenterEntity | null>;
  create(dto: CreateProfessionalCenterDto): Promise<boolean>;
  update(id: string, dto: UpdateProfessionalCenterDto): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
