import {
  ActivityDetailResponseDto,
  ActivityMonthSlotsResponseDto,
  SearchActivitiesQueryDto,
  SearchActivitiesResponseDto,
} from '@features/activity/domains/dtos/activity.dto';
import { IActivityService } from '@features/activity/interfaces/services/activity.iservice';
import { Public } from '@core/decorators/public.decorator';
import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { IUploadService } from '@features/uploads/interfaces/services/upload.iservice';

@ApiTags('Activities — Search')
@Controller('activities')
export class ActivitySearchController {
  constructor(
    @Inject('IActivityService')
    private readonly activityService: IActivityService,
    @Inject('IUploadService')
    private readonly uploadService: IUploadService,
  ) {}

  @Public()
  @ApiOperation({
    summary: 'Search activities with filters',
    description:
      'Public search over published activities with multi-criteria filters (type, price, difficulty, free text). Pagination of 20 results per page, sorted by relevance or price.',
  })
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: [
      'bungee',
      'climbing',
      'diving',
      'paragliding',
      'canyoning',
      'via_ferrata',
    ],
  })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  @ApiQuery({ name: 'radiusKm', required: false, type: Number })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'priceMin', required: false, type: Number })
  @ApiQuery({ name: 'priceMax', required: false, type: Number })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['relevance', 'price_asc', 'price_desc', 'distance'],
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: SearchActivitiesResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @Get('search')
  async search(
    @Query() query: SearchActivitiesQueryDto,
  ): Promise<SearchActivitiesResponseDto> {
    return this.activityService.search(query);
  }

  @Public()
  @ApiOperation({
    summary: 'Public photo of an activity',
    description:
      'Serves an image without authentication, only if a published activity references it. The other stored files (KYC supporting documents) stay protected behind GET /uploads/:id.',
  })
  @ApiParam({ name: 'fileId', description: 'The file identifier' })
  @ApiResponse({ status: 200, description: 'The image content' })
  @ApiResponse({ status: 404, description: 'Photo not found' })
  @Get('photos/:fileId')
  async photo(
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ): Promise<void> {
    const file = (await this.activityService.isPublicPhoto(fileId))
      ? await this.uploadService.findPublicById(fileId)
      : null;

    // Un fichier non reference par une activite publiee est traite comme
    // absent : repondre 403 revelerait son existence au depot.
    if (!file) {
      throw new NotFoundException('Photo introuvable');
    }

    res.setHeader('Content-Type', file.getMimeType());
    res.setHeader('Content-Length', file.getSizeBytes());
    res.setHeader('Cache-Control', 'public, max-age=3600');

    this.uploadService.openDownloadStream(fileId).pipe(res);
  }

  @Public()
  @ApiOperation({
    summary: 'Detailed page of an activity',
    description:
      'Returns the full page of a published activity: photo and video gallery, description, prerequisites, included equipment, slots available over 90 days, summary of verified reviews.',
  })
  @ApiParam({
    name: 'id',
    description: 'The activity identifier',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The detailed activity page',
    type: ActivityDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Activity not found or disabled',
  })
  @Public()
  @ApiOperation({
    summary: "An activity's slots for a given month",
    description:
      'Returns the slots for the requested month and the list of upcoming ' +
      'months that contain some. Loading one month at a time avoids sending a ' +
      'whole year of slots for a long recurrence.',
  })
  @ApiParam({
    name: 'id',
    description: 'The activity identifier',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'month',
    description:
      'Target month in YYYY-MM format. Defaults to the current month.',
    required: false,
    example: '2026-09',
  })
  @ApiResponse({
    status: 200,
    description: 'Slots for the month and available months',
    type: ActivityMonthSlotsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Malformed month' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @Get(':id/slots')
  async findSlotsByMonth(
    @Param('id') id: string,
    @Query('month') month?: string,
  ): Promise<ActivityMonthSlotsResponseDto> {
    const target = month ?? new Date().toISOString().slice(0, 7);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(target)) {
      throw new BadRequestException('Mois attendu au format YYYY-MM');
    }

    const slots = await this.activityService.findSlotsByMonth(id, target);
    if (!slots) {
      throw new NotFoundException('Activite introuvable ou desactivee');
    }
    return slots;
  }

  @Get(':id')
  async findDetail(
    @Param('id') id: string,
  ): Promise<ActivityDetailResponseDto> {
    const detail = await this.activityService.findDetailById(id);
    if (!detail) {
      throw new NotFoundException('Activité introuvable ou désactivée');
    }
    return detail;
  }
}
