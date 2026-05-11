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
    summary: 'Signer la décharge électronique (US-16)',
    description:
      "Permet à un aventurier de signer la décharge de responsabilité en ligne avant l'activité. " +
      'Supporte la signature manuscrite (canvas base64) ou OTP SMS (code 6 chiffres). ' +
      'Le document est horodaté et son intégrité garantie par un hash SHA-256 (niveau eIDAS simple).',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant de la réservation',
    required: true,
    type: String,
  })
  @ApiBody({
    type: SignWaiverDto,
    description: 'Données de signature de la décharge',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Décharge signée avec succès',
    type: SignWaiverResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Signature invalide ou OTP incorrect',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({
    status: 409,
    description: 'Décharge déjà signée pour cette réservation',
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
