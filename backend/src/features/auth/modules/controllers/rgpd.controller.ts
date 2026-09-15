import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  RgpdDeleteDto,
  RgpdDeleteResponseDto,
  RgpdExportResponseDto,
} from '@features/auth/domains/dtos/user.dto';
import { IUserService } from '@features/auth/interfaces/services/user.iservice';

@ApiTags('GDPR')
@Controller('users/me/rgpd')
export class RgpdController {
  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
  ) {}

  @ApiOperation({
    summary: 'GDPR export',
    description:
      'Immediately exports (synchronous processing) all the personal data of the signed-in user: profile, health profile (with decrypted contraindications), notification preferences, bookings and invoices. The data is returned directly in the response in JSON format. JWT authentication required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Export completed, data returned in the response body',
    type: RgpdExportResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  @Post('export')
  @HttpCode(HttpStatus.OK)
  async requestExport(
    @Req() req: { user: { sub: string } },
  ): Promise<RgpdExportResponseDto> {
    const userId = req.user.sub;
    return this.userService.requestRgpdExport(userId);
  }

  @ApiOperation({
    summary: 'GDPR deletion request',
    description:
      'Requests the deletion of all the personal data. Requires a confirmation code sent by email (double consent). The deletion is scheduled for D+30 (withdrawal period). Accounting data is retained to meet a legal obligation (10 years). JWT authentication required.',
  })
  @ApiBody({
    type: RgpdDeleteDto,
    description: 'Confirmation code and optional reason',
    required: true,
  })
  @ApiResponse({
    status: 202,
    description: 'Deletion request accepted and scheduled for D+30',
    type: RgpdDeleteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid confirmation code',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: 409,
    description: 'A GDPR deletion request is already scheduled',
  })
  @Post('delete')
  @HttpCode(HttpStatus.ACCEPTED)
  async requestDelete(
    @Req() req: { user: { sub: string } },
    @Body() dto: RgpdDeleteDto,
  ): Promise<RgpdDeleteResponseDto> {
    const userId = req.user.sub;
    return this.userService.requestRgpdDelete(userId, dto);
  }
}
