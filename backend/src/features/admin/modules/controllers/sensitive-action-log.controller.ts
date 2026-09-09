import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { RolesGuard } from '@core/roles/roles.guard';
import { Roles } from '@core/roles/roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuditLogsQueryDto,
  AuditLogsResponseDto,
} from '@features/admin/domains/dtos/sensitive-action-log.dto';
import { ISensitiveActionLogService } from '@features/admin/interfaces/services/sensitive-action-log.iservice';

@ApiTags('Admin — Audit Logs')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('admin')
@Controller('admin/audit-logs')
export class SensitiveActionLogController {
  constructor(
    @Inject('ISensitiveActionLogService')
    private readonly sensitiveActionLogService: ISensitiveActionLogService,
  ) {}

  @ApiOperation({
    summary: 'Get audit logs (US-25)',
    description:
      'Returns paginated audit logs for sensitive actions. Requires admin role. Supports filtering by actorId, actionType, date range, and severity.',
  })
  @ApiQuery({ name: 'actorId', required: false, type: String })
  @ApiQuery({
    name: 'actionType',
    required: false,
    enum: [
      'auth.login',
      'auth.login_failed',
      'user.status_changed',
      'center.reviewed',
      'data.deleted',
      'payment.refunded',
    ],
  })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiQuery({
    name: 'severity',
    required: false,
    enum: ['info', 'warning', 'critical'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Audit logs returned',
    type: AuditLogsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not admin role' })
  @Get()
  async getAuditLogs(
    @Query() query: AuditLogsQueryDto,
  ): Promise<AuditLogsResponseDto> {
    // Le controle de role est assure par RolesGuard : le comparer a la main
    // exposait a une erreur de casse, le payload JWT portant « admin » en
    // minuscules.
    return this.sensitiveActionLogService.findAuditLogs(query);
  }
}
