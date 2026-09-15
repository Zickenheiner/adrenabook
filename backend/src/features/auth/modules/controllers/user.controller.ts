import {
  CreateUserDto,
  DashboardResponseDto,
  UpdateUserDto,
  UserResponseDto,
} from '@features/auth/domains/dtos/user.dto';
import { IUserService } from '@features/auth/interfaces/services/user.iservice';
import { Roles } from '@core/roles/roles.decorator';
import { RolesGuard } from '@core/roles/roles.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

/**
 * Requete authentifiee : `user` est injecte par `AccessTokenGuard` a partir du
 * payload JWT ({ sub, email, role }).
 */
interface AuthenticatedRequest {
  user: { sub: string; email: string; role: string };
}

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('users')
export class UserController {
  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
  ) {}

  @ApiOperation({
    summary: 'Adventurer dashboard',
    description:
      "Returns the signed-in user's 3 next bookings and 4 suggested activities (based on booking history, or random).",
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data',
    type: DashboardResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Get('me/dashboard')
  @HttpCode(HttpStatus.OK)
  async getDashboard(
    @Req() req: AuthenticatedRequest,
  ): Promise<DashboardResponseDto> {
    return this.userService.getDashboard(req.user.sub);
  }

  @ApiOperation({
    summary: 'Get all users (admin)',
    description:
      'Retrieve a list of all users. Restricted to administrators. Secrets (password, tokens, 2FA codes) are never exposed.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Restricted to administrators' })
  @Roles('admin')
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return (users ?? []).map((user) => UserResponseDto.fromEntity(user));
  }

  @ApiOperation({
    summary: 'Get user by id (owner or admin)',
    description:
      'Retrieve a user by its id. Accessible only by the account owner or by an administrator. Secrets are never exposed.',
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the user to retrieve',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The user with the given id',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<UserResponseDto> {
    this.assertSelfOrAdmin(id, req);
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    return UserResponseDto.fromEntity(user);
  }

  @ApiOperation({
    summary: 'Create user (admin)',
    description: 'Create a new user. Restricted to administrators.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'The data to create a new user',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'The created user',
    type: Boolean,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Restricted to administrators' })
  @Roles('admin')
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @ApiOperation({
    summary: 'Update user (owner or admin)',
    description:
      'Update a user. Accessible only by the account owner or by an administrator.',
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the user to update',
    required: true,
    type: String,
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'The updated user data',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'The updated user',
    type: Boolean,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    this.assertSelfOrAdmin(id, req);
    return this.userService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Delete user (admin)',
    description: 'Delete a user. Restricted to administrators.',
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the user to delete',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The deleted user',
    type: Boolean,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Restricted to administrators' })
  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  /**
   * Autorise l'acces si l'appelant est le proprietaire de la ressource, sinon
   * uniquement s'il est administrateur.
   */
  private assertSelfOrAdmin(id: string, req: AuthenticatedRequest): void {
    const isSelf = req.user?.sub === id;
    const isAdmin = (req.user?.role ?? '').toLowerCase() === 'admin';
    if (!isSelf && !isAdmin) {
      throw new ForbiddenException(
        'Acces refuse : vous ne pouvez agir que sur votre propre compte',
      );
    }
  }
}
