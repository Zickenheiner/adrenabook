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
import { IWaiverService } from '@features/waiver/interfaces/services/waiver.iservice';
import {
  SignWaiverDto,
  SignWaiverResponseDto,
} from '@features/waiver/domains/dtos/waiver.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class WaiverController {
  constructor(
    @Inject('IWaiverService')
    private readonly waiverService: IWaiverService,
  ) {}

  @ApiOperation({
    summary: 'Sign the electronic waiver',
    description:
      'Lets an adventurer sign the liability waiver online before the activity. ' +
      'Supports handwritten signature (base64 canvas) or SMS OTP (6-digit code). ' +
      'The document is timestamped and its integrity is guaranteed by a SHA-256 hash (simple eIDAS level).',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking identifier',
    required: true,
    type: String,
  })
  @ApiBody({
    type: SignWaiverDto,
    description: 'Waiver signature data',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Waiver signed successfully',
    type: SignWaiverResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid signature or incorrect OTP',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 409,
    description: 'Waiver already signed for this booking',
  })
  @Post(':id/waiver/sign')
  @HttpCode(HttpStatus.CREATED)
  async signWaiver(
    @Param('id') bookingId: string,
    @Body() dto: SignWaiverDto,
    @Req() req: { user: { sub: string } },
  ): Promise<SignWaiverResponseDto> {
    return this.waiverService.signWaiver(bookingId, req.user.sub, dto);
  }
}
