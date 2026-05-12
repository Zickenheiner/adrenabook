import type { DashboardEntity } from '../../domain/entities/dashboard.entity';
import type { DashboardResponseDto } from '../dtos/dashboard.dto';

class DashboardMapper {
  toEntity(dto: DashboardResponseDto): DashboardEntity {
    return {
      revenue: {
        totalEur: dto.revenue.totalEur,
        vsPreviousPeriod: dto.revenue.vsPreviousPeriod,
        series: dto.revenue.series.map((s) => ({
          date: s.date,
          valueEur: s.valueEur,
        })),
      },
      bookings: {
        confirmed: dto.bookings.confirmed,
        cancelled: dto.bookings.cancelled,
        cancellationRate: dto.bookings.cancellationRate,
      },
      occupancyRate: dto.occupancyRate,
      averageBasketEur: dto.averageBasketEur,
      topActivities: dto.topActivities.map((a) => ({
        activityId: a.activityId,
        title: a.title,
        bookingsCount: a.bookingsCount,
        revenueEur: a.revenueEur,
      })),
    };
  }
}

export default DashboardMapper;
