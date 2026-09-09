import {
  CentersListResponseDto,
  CentersMapQueryDto,
  CentersMapResponseDto,
  CentersQueryDto,
  CreateCenterDto,
  UpdateCenterDto,
} from '@features/centers/domains/dtos/center.dto';
import { CenterEntity } from '@features/centers/domains/entities/center.entity';

export interface ICenterService {
  findAll(): Promise<CenterEntity[] | null>;
  findById(id: string): Promise<CenterEntity | null>;
  create(dto: CreateCenterDto): Promise<CenterEntity | null>;
  update(id: string, dto: UpdateCenterDto): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  getMap(query: CentersMapQueryDto): Promise<CentersMapResponseDto>;
  getCenters(query: CentersQueryDto): Promise<CentersListResponseDto>;
}
