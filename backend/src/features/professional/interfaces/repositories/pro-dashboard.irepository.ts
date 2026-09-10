import {
  DashboardQueryDto,
  DashboardResponseDto,
} from '@features/professional/domains/dtos/pro-dashboard.dto';

export interface IProDashboardRepository {
  getDashboard(
    centerId: string,
    query: DashboardQueryDto,
  ): Promise<DashboardResponseDto>;
}
