import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '@core/roles/roles.guard';
import { Roles } from '@core/roles/roles.decorator';
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
import {
  ADMIN_USERS_DEFAULT_LIMIT,
  ADMIN_USERS_MAX_LIMIT,
  AdminUserListItemDto,
  AdminUserListQueryDto,
  AdminUserListResponseDto,
} from '@features/admin/domains/dtos/admin-user-list.dto';

@ApiTags('Admin — Users')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('admin')
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
    const actor = req.user as { sub: string; role?: string };
    return this.adminUserStatusService.updateUserStatus(
      id,
      dto,
      actor.sub,
      actor.role ?? 'unknown',
    );
  }

  @ApiOperation({
    summary: 'Lister les comptes (US-22)',
    description:
      'Liste paginee des comptes, du plus recent au plus ancien. Reservee aux ' +
      'administrateurs. La reponse ne contient aucun secret : ni mot de passe, ni ' +
      'refresh token, ni jeton de verification.',
  })
  @ApiResponse({ status: 200, type: AdminUserListResponseDto })
  @ApiResponse({ status: 403, description: 'Reserve aux administrateurs' })
  @Get()
  async list(
    @Query() query: AdminUserListQueryDto,
  ): Promise<AdminUserListResponseDto> {
    const page = query.page ?? 1;
    const limit = Math.min(
      query.limit ?? ADMIN_USERS_DEFAULT_LIMIT,
      ADMIN_USERS_MAX_LIMIT,
    );
    return this.adminUserStatusService.listUsers(page, limit);
  }

  @ApiOperation({ summary: "Fiche d'un compte (US-22)" })
  @ApiParam({ name: 'id', description: 'Identifiant du compte', type: String })
  @ApiResponse({ status: 200, type: AdminUserListItemDto })
  @ApiResponse({ status: 404, description: 'Compte introuvable' })
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<AdminUserListItemDto> {
    return this.adminUserStatusService.getUser(id);
  }
}
