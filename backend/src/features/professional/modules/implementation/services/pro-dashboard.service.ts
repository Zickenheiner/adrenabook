import { Inject, Injectable } from '@nestjs/common';
import { IProDashboardService } from '@features/professional/interfaces/services/pro-dashboard.iservice';
import { IProDashboardRepository } from '@features/professional/interfaces/repositories/pro-dashboard.irepository';
import {
  CenterBookingDto,
  DashboardQueryDto,
  DashboardResponseDto,
} from '@features/professional/domains/dtos/pro-dashboard.dto';

@Injectable()
export class ProDashboardService implements IProDashboardService {
  constructor(
    @Inject('IProDashboardRepository')
    private readonly proDashboardRepository: IProDashboardRepository,
  ) {}

  async getDashboard(
    centerId: string,
    query: DashboardQueryDto,
  ): Promise<DashboardResponseDto> {
    return this.proDashboardRepository.getDashboard(centerId, query);
  }

  async findCenterBookings(
    userId: string,
    centerId?: string,
  ): Promise<CenterBookingDto[]> {
    return this.proDashboardRepository.findCenterBookings(userId, centerId);
  }
}
