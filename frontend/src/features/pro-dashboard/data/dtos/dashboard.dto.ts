export interface DashboardQueryDto {
  range: 'day' | 'week' | 'month' | 'quarter' | 'year';
  from?: string;
  to?: string;
}

export interface RevenueSeriesItemDto {
  date: string;
  valueEur: number;
}

export interface RevenueDtoResponse {
  totalEur: number;
  vsPreviousPeriod: number;
  series: RevenueSeriesItemDto[];
}

export interface BookingsDtoResponse {
  confirmed: number;
  cancelled: number;
  cancellationRate: number;
}

export interface TopActivityDto {
  activityId: string;
  title: string;
  bookingsCount: number;
  revenueEur: number;
}

export interface DashboardResponseDto {
  revenue: RevenueDtoResponse;
  bookings: BookingsDtoResponse;
  occupancyRate: number;
  averageBasketEur: number;
  topActivities: TopActivityDto[];
}
