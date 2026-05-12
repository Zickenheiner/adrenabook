import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  UpdateUserStatusDto,
  UpdateUserStatusResponseDto,
} from '@features/admin/domains/dtos/update-user-status.dto';
import { IAdminUserStatusService } from '@features/admin/interfaces/services/admin-user-status.iservice';

@ApiTags('Admin — Users')
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUserStatusController {
  constructor(
    @Inject('IAdminUserStatusService')
    private readonly adminUserStatusService: IAdminUserStatusService,
  ) {}

  @ApiOperation({
    summary: 'Update user status (US-22)',
    description:
      'Allows an admin to set a user status to active, suspended or banned. A mandatory reason must be provided. Creates an audit log entry for every change.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the user to update',
    required: true,
    type: String,
  })
  @ApiBody({
    type: UpdateUserStatusDto,
    description: 'New status, reason and optional suspension duration',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated',
    type: UpdateUserStatusResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not admin role' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() req: Record<string, unknown>,
  ): Promise<UpdateUserStatusResponseDto> {
    const adminId = (req.user as { sub: string }).sub;
    return this.adminUserStatusService.updateUserStatus(id, dto, adminId);
  }
}
