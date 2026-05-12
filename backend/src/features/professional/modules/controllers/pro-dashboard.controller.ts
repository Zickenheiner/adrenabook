import { Controller, Get, Inject, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IProDashboardService } from '@features/professional/interfaces/services/pro-dashboard.iservice';
import {
  DashboardQueryDto,
  DashboardResponseDto,
} from '@features/professional/domains/dtos/pro-dashboard.dto';

@ApiTags('pro-dashboard')
@Controller('pro/dashboard')
export class ProDashboardController {
  constructor(
    @Inject('IProDashboardService')
    private readonly proDashboardService: IProDashboardService,
  ) {}

  @ApiOperation({
    summary: 'Get professional dashboard with KPIs',
    description:
      'Returns revenue, bookings stats, occupancy rate, average basket and top activities for the authenticated professional.',
  })
  @ApiQuery({
    name: 'range',
    enum: ['day', 'week', 'month', 'quarter', 'year'],
    required: true,
    description: 'Time range for the dashboard data',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date override (ISO 8601)',
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'End date override (ISO 8601)',
    example: '2026-03-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard returned',
    type: DashboardResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not a professional role' })
  @Get()
  async getDashboard(
    @Query() query: DashboardQueryDto,
    @Req() req: { user: { sub: string } },
  ): Promise<DashboardResponseDto> {
    return this.proDashboardService.getDashboard(req.user.sub, query);
  }
}
