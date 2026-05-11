import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
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
  ReviewCenterDto,
  ReviewCenterResponseDto,
} from '@features/admin/domains/dtos/center-review.dto';
import { ICenterReviewService } from '@features/admin/interfaces/services/center-review.iservice';

@ApiTags('Admin — KYC')
@ApiBearerAuth()
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
    const adminId = (req.user as { sub: string }).sub;
    return this.centerReviewService.reviewCenter(id, dto, adminId);
  }
}
