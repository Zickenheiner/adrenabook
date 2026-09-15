import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  PendingCenterDto,
  ReviewCenterDto,
  ReviewCenterResponseDto,
} from '@features/admin/domains/dtos/center-review.dto';
import { ICenterReviewService } from '@features/admin/interfaces/services/center-review.iservice';

@ApiTags('Admin — KYC')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('admin')
@Controller('admin/centers')
export class CenterReviewController {
  constructor(
    @Inject('ICenterReviewService')
    private readonly centerReviewService: ICenterReviewService,
  ) {}

  @ApiOperation({
    summary: 'Review a professional center KYC dossier',
    description:
      'Allows an admin to approve, reject or request more info on a pending center registration. Updates the center status and notifies the applicant.',
  })
  @ApiParam({
    name: 'id',
    description: 'The MongoDB ObjectId of the professional center to review',
    required: true,
    type: String,
  })
  @ApiBody({
    type: ReviewCenterDto,
    description: 'Review decision and optional comments / rejection reason',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Decision recorded',
    type: ReviewCenterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (e.g. rejection without a reason)',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not admin role' })
  @ApiResponse({ status: 404, description: 'Center not found' })
  @ApiResponse({ status: 409, description: 'Dossier already processed' })
  @Post(':id/review')
  @HttpCode(HttpStatus.OK)
  async reviewCenter(
    @Param('id') id: string,
    @Body() dto: ReviewCenterDto,
    @Req() req: Record<string, unknown>,
  ): Promise<ReviewCenterResponseDto> {
    const actor = req.user as { sub: string; role?: string };
    return this.centerReviewService.reviewCenter(
      id,
      dto,
      actor.sub,
      actor.role ?? 'unknown',
    );
  }

  @ApiOperation({
    summary: 'List professional center dossiers',
    description:
      'Returns center registration dossiers, from the most recent to the oldest. ' +
      'Filterable by status. Supporting documents are exposed through their file ' +
      'identifier: the client retrieves them via GET /uploads/:id, which enforces ' +
      'access control.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending_review', 'approved', 'rejected'],
    description: 'Optional filter on the dossier status',
  })
  @ApiResponse({ status: 200, type: [PendingCenterDto] })
  @ApiResponse({ status: 403, description: 'Restricted to administrators' })
  @Get()
  async list(@Query('status') status?: string): Promise<PendingCenterDto[]> {
    return this.centerReviewService.listCenters(status);
  }

  @ApiOperation({
    summary: 'Get a professional center dossier',
  })
  @ApiParam({ name: 'id', description: 'Center identifier', type: String })
  @ApiResponse({ status: 200, type: PendingCenterDto })
  @ApiResponse({ status: 404, description: 'Dossier not found' })
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<PendingCenterDto> {
    return this.centerReviewService.getCenter(id);
  }
}
