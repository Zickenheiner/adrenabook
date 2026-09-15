import {
  ActivityResponseDto,
  CreateActivityDto,
  UpdateActivityDto,
} from '@features/activity/domains/dtos/activity.dto';
import { ActivityEntity } from '@features/activity/domains/entities/activity.entity';
import { IActivityService } from '@features/activity/interfaces/services/activity.iservice';
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
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('Pro — Activities')
@ApiBearerAuth()
@Controller('pro/activities')
export class ActivityController {
  constructor(
    @Inject('IActivityService')
    private readonly activityService: IActivityService,
  ) {}

  @ApiOperation({
    summary: 'Create an activity',
    description:
      "Creates a new activity for the authenticated professional's center. Professional role required. The activity is always created unpublished: it is put online afterwards through PATCH.",
  })
  @ApiBody({
    type: CreateActivityDto,
    description: 'The activity data to create',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Activity created',
    type: ActivityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Center not validated by an admin' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateActivityDto,
    @Req() req: { user: { sub: string; role: string } },
    @Query('centerId') centerId?: string,
  ): Promise<ActivityResponseDto> {
    const user = req.user;
    if (!user || user.role !== 'professionnel') {
      throw new ForbiddenException(
        'Accès réservé aux professionnels avec un centre validé',
      );
    }
    const result = await this.activityService.create(dto, user.sub, centerId);
    if (!result) {
      throw new ForbiddenException(
        "Impossible de créer l'activité. Centre non validé.",
      );
    }
    return result;
  }

  @ApiOperation({
    summary: 'List the activities of the current center',
    description:
      "Returns all the activities of the authenticated professional's center.",
  })
  @ApiResponse({
    status: 200,
    description: 'List of activities',
    type: [ActivityEntity],
  })
  @ApiQuery({
    name: 'centerId',
    description: 'The center whose activities are requested',
    required: true,
    type: String,
  })
  @ApiResponse({ status: 403, description: 'Center not owned by the account' })
  @Get('my')
  async findMine(
    @Req() req: { user: { sub: string } },
    @Query('centerId') centerId: string,
  ): Promise<ActivityEntity[] | null> {
    return this.activityService.findMine(req.user.sub, centerId);
  }

  @ApiOperation({
    summary: 'Get all activities',
    description: 'Returns all activities (admin/internal access)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all activities',
    type: [ActivityEntity],
  })
  @Get()
  async findAll(): Promise<ActivityEntity[] | null> {
    return this.activityService.findAll();
  }

  @ApiOperation({
    summary: 'Get an activity by ID',
    description: 'Returns an activity by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'The activity identifier',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The requested activity',
    type: ActivityEntity,
  })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @Get(':id')
  async findById(@Param('id') id: string): Promise<ActivityEntity> {
    const activity = await this.activityService.findById(id);
    if (!activity) {
      throw new NotFoundException('Activité introuvable');
    }
    return activity;
  }

  @ApiOperation({
    summary: 'Update an activity',
    description:
      'Updates the fields of an existing activity, including its publication status. Professional role required.',
  })
  @ApiParam({
    name: 'id',
    description: 'The identifier of the activity to update',
    required: true,
    type: String,
  })
  @ApiBody({
    type: UpdateActivityDto,
    description: 'The updated activity data',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Activity updated',
    type: Boolean,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateActivityDto,
    @Req() req: { user: { sub: string; role: string } },
  ): Promise<boolean> {
    const user = req.user;
    if (!user || user.role !== 'professionnel') {
      throw new ForbiddenException('Accès réservé aux professionnels');
    }
    return this.activityService.update(id, dto, user.sub);
  }

  @ApiOperation({
    summary: 'Delete an activity',
    description: 'Permanently deletes an activity. Professional role required.',
  })
  @ApiParam({
    name: 'id',
    description: 'The identifier of the activity to delete',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Activity deleted',
    type: Boolean,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: { user: { sub: string; role: string } },
  ): Promise<boolean> {
    const user = req.user;
    if (!user || user.role !== 'professionnel') {
      throw new ForbiddenException('Accès réservé aux professionnels');
    }
    return this.activityService.delete(id, user.sub);
  }
}
