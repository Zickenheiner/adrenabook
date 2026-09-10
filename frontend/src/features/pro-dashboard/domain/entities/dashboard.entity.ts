export interface RevenueSeriesItemEntity {
  date: string;
  valueEur: number;
}

export interface RevenueEntity {
  totalEur: number;
  vsPreviousPeriod: number;
  series: RevenueSeriesItemEntity[];
}

export interface BookingsEntity {
  confirmed: number;
  cancelled: number;
  cancellationRate: number;
}

export interface TopActivityEntity {
  activityId: string;
  title: string;
  bookingsCount: number;
  revenueEur: number;
}

export interface DashboardEntity {
  revenue: RevenueEntity;
  bookings: BookingsEntity;
  occupancyRate: number;
  averageBasketEur: number;
  topActivities: TopActivityEntity[];
}
