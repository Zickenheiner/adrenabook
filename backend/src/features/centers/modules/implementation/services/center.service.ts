import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICenterService } from '../../../interfaces/services/center.iservice';
import { ICenterRepository } from '@features/centers/interfaces/repositories/center.irepository';
import {
  CenterDetailResponseDto,
  CentersListResponseDto,
  CentersMapQueryDto,
  CentersMapResponseDto,
  CentersQueryDto,
} from '@features/centers/domains/dtos/center.dto';

@Injectable()
export class CenterService implements ICenterService {
  constructor(
    @Inject('ICenterRepository')
    private readonly centerRepository: ICenterRepository,
  ) {}

  async getMap(query: CentersMapQueryDto): Promise<CentersMapResponseDto> {
    const parts = query.bbox.split(',').map(Number);
    if (parts.length !== 4 || parts.some((n) => isNaN(n))) {
      throw new BadRequestException(
        'BBox malformée — format attendu : minLng,minLat,maxLng,maxLat',
      );
    }

    const centers = await this.centerRepository.findByBbox(query);

    const CLUSTER_ZOOM_THRESHOLD = 8;
    const shouldCluster = query.zoom < CLUSTER_ZOOM_THRESHOLD;

    if (shouldCluster && centers && centers.length > 1) {
      return {
        centers: [
          {
            id: centers[0].getId(),
            name: `${centers.length} centres`,
            lat:
              centers.reduce((sum, c) => sum + c.getLat(), 0) / centers.length,
            lng:
              centers.reduce((sum, c) => sum + c.getLng(), 0) / centers.length,
            activitiesCount: centers.reduce(
              (sum, c) => sum + c.getActivitiesCount(),
              0,
            ),
            cluster: true,
            clusterSize: centers.length,
          },
        ],
      };
    }

    return {
      centers: (centers ?? []).map((c) => ({
        id: c.getId(),
        name: c.getName(),
        lat: c.getLat(),
        lng: c.getLng(),
        activitiesCount: c.getActivitiesCount(),
      })),
    };
  }

  async getCenterDetail(id: string): Promise<CenterDetailResponseDto> {
    const center = await this.centerRepository.findDetailById(id);
    if (!center) {
      throw new NotFoundException('Centre introuvable');
    }
    return center;
  }

  async getCenters(query: CentersQueryDto): Promise<CentersListResponseDto> {
    const centers = await this.centerRepository.findByRadius(query);

    return {
      centers: (centers ?? []).map((c) => ({
        id: c.getId(),
        name: c.getName(),
        lat: c.getLat(),
        lng: c.getLng(),
        city: c.getCity(),
        activitiesCount: c.getActivitiesCount(),
      })),
    };
  }
}
