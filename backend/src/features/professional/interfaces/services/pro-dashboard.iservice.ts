import {
  CenterBookingDto,
  DashboardQueryDto,
  DashboardResponseDto,
} from '@features/professional/domains/dtos/pro-dashboard.dto';

export interface IProDashboardService {
  getDashboard(
    centerId: string,
    query: DashboardQueryDto,
  ): Promise<DashboardResponseDto>;

  /** Reservations prises sur les activites d'un centre, de la plus proche. */
  findCenterBookings(
    userId: string,
    centerId?: string,
  ): Promise<CenterBookingDto[]>;
}
