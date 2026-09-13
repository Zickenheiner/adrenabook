import {
  CenterDetailResponseDto,
  CentersListResponseDto,
  CentersMapQueryDto,
  CentersMapResponseDto,
  CentersQueryDto,
} from '@features/centers/domains/dtos/center.dto';

export interface ICenterService {
  getMap(query: CentersMapQueryDto): Promise<CentersMapResponseDto>;
  getCenters(query: CentersQueryDto): Promise<CentersListResponseDto>;
  getCenterDetail(id: string): Promise<CenterDetailResponseDto>;
}
