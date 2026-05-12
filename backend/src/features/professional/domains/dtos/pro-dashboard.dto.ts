import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional } from 'class-validator';

export type DashboardRange = 'day' | 'week' | 'month' | 'quarter' | 'year';

export class DashboardQueryDto {
  @ApiProperty({
    description: 'Time range for the dashboard data',
    enum: ['day', 'week', 'month', 'quarter', 'year'],
    example: 'month',
  })
  @IsEnum(['day', 'week', 'month', 'quarter', 'year'])
  range: DashboardRange;

  @ApiProperty({
    description: 'Start date override (ISO 8601)',
    example: '2026-01-01',
    required: false,
  })
  @IsISO8601()
  @IsOptional()
  from?: string;

  @ApiProperty({
    description: 'End date override (ISO 8601)',
    example: '2026-03-31',
    required: false,
  })
  @IsISO8601()
  @IsOptional()
  to?: string;
}

export class RevenueSeriesItemDto {
  @ApiProperty({ example: '2026-01-15', description: 'Date of the data point' })
  date: string;

  @ApiProperty({ example: 150.0, description: 'Revenue in EUR for this date' })
  valueEur: number;
}

export class RevenueDto {
  @ApiProperty({ example: 4200.0, description: 'Total revenue in EUR' })
  totalEur: number;

  @ApiProperty({
    example: 12.5,
    description: 'Percentage change vs previous period',
  })
  vsPreviousPeriod: number;

  @ApiProperty({
    type: [RevenueSeriesItemDto],
    description: 'Revenue time series',
  })
  series: RevenueSeriesItemDto[];
}

export class BookingsStatsDto {
  @ApiProperty({ example: 42, description: 'Number of confirmed bookings' })
  confirmed: number;

  @ApiProperty({ example: 5, description: 'Number of cancelled bookings' })
  cancelled: number;

  @ApiProperty({ example: 10.64, description: 'Cancellation rate in percent' })
  cancellationRate: number;
}

export class TopActivityDto {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'Activity ID',
  })
  activityId: string;

  @ApiProperty({ example: 'Parachute tandem', description: 'Activity title' })
  title: string;

  @ApiProperty({ example: 18, description: 'Number of confirmed bookings' })
  bookingsCount: number;

  @ApiProperty({ example: 2700.0, description: 'Revenue generated in EUR' })
  revenueEur: number;
}

export class DashboardResponseDto {
  @ApiProperty({ type: RevenueDto })
  revenue: RevenueDto;

  @ApiProperty({ type: BookingsStatsDto })
  bookings: BookingsStatsDto;

  @ApiProperty({ example: 68.5, description: 'Occupancy rate in percent' })
  occupancyRate: number;

  @ApiProperty({ example: 100.0, description: 'Average basket in EUR' })
  averageBasketEur: number;

  @ApiProperty({ type: [TopActivityDto], description: 'Top 3 activities' })
  topActivities: TopActivityDto[];
}
