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
    summary: 'Review a professional center KYC dossier (US-23)',
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
    summary: 'Lister les dossiers de centres professionnels (US-23)',
    description:
      "Renvoie les dossiers d'inscription de centres, du plus récent au plus ancien. " +
      'Filtrable par statut. Les pièces justificatives sont exposées par leur ' +
      'identifiant de fichier : le client les récupère via GET /uploads/:id, qui ' +
      "contrôle le droit d'accès.",
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending_review', 'approved', 'rejected'],
    description: 'Filtre optionnel sur le statut du dossier',
  })
  @ApiResponse({ status: 200, type: [PendingCenterDto] })
  @ApiResponse({ status: 403, description: 'Réservé aux administrateurs' })
  @Get()
  async list(@Query('status') status?: string): Promise<PendingCenterDto[]> {
    return this.centerReviewService.listCenters(status);
  }

  @ApiOperation({
    summary: "Détail d'un dossier de centre professionnel (US-23)",
  })
  @ApiParam({ name: 'id', description: 'Identifiant du centre', type: String })
  @ApiResponse({ status: 200, type: PendingCenterDto })
  @ApiResponse({ status: 404, description: 'Dossier introuvable' })
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<PendingCenterDto> {
    return this.centerReviewService.getCenter(id);
  }
}
