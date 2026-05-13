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

@ApiTags('RGPD')
@Controller('users/me/rgpd')
export class RgpdController {
  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
  ) {}

  @ApiOperation({
    summary: "Demande d'export RGPD (US-24)",
    description:
      "Cree une demande asynchrone d'export de toutes les donnees personnelles (profil, reservations, factures, avis) au format JSON. La demande est mise en file d'attente et le fichier sera disponible sous 24h. Auth JWT requise.",
  })
  @ApiResponse({
    status: 202,
    description: "Demande d'export acceptee (traitement asynchrone)",
    type: RgpdExportResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifie',
  })
  @ApiResponse({
    status: 409,
    description: 'Une demande RGPD est deja en cours',
  })
  @Post('export')
  @HttpCode(HttpStatus.ACCEPTED)
  async requestExport(
    @Req() req: { user: { sub: string } },
  ): Promise<RgpdExportResponseDto> {
    const userId = req.user.sub;
    return this.userService.requestRgpdExport(userId);
  }

  @ApiOperation({
    summary: 'Demande de suppression RGPD (US-24)',
    description:
      'Demande la suppression de toutes les donnees personnelles. Necessite un code de confirmation envoye par email (double consentement). La suppression est planifiee a J+30 (delai de retractation). Les donnees comptables sont conservees pour obligation legale (10 ans). Auth JWT requise.',
  })
  @ApiBody({
    type: RgpdDeleteDto,
    description: 'Code de confirmation et raison optionnelle',
    required: true,
  })
  @ApiResponse({
    status: 202,
    description: 'Demande de suppression acceptee et planifiee a J+30',
    type: RgpdDeleteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Code de confirmation invalide',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifie',
  })
  @ApiResponse({
    status: 409,
    description: 'Une demande de suppression RGPD est deja planifiee',
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
