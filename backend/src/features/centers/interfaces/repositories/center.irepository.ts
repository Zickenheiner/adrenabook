import {
  CentersMapQueryDto,
  CentersQueryDto,
  CreateCenterDto,
  UpdateCenterDto,
} from '@features/centers/domains/dtos/center.dto';
import { CenterEntity } from '@features/centers/domains/entities/center.entity';

export interface ICenterRepository {
  findAll(): Promise<CenterEntity[] | null>;
  findById(id: string): Promise<CenterEntity | null>;
  create(dto: CreateCenterDto): Promise<CenterEntity | null>;
  update(id: string, dto: UpdateCenterDto): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  findByBbox(query: CentersMapQueryDto): Promise<CenterEntity[] | null>;
  findByRadius(query: CentersQueryDto): Promise<CenterEntity[] | null>;
}
