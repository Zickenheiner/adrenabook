import {
  CreateSlotsDto,
  CreateSlotsResponseDto,
  ProSlotMonthResponseDto,
} from '@features/slot/domains/dtos/slot.dto';
import { ISlotService } from '@features/slot/interfaces/services/slot.iservice';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
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

@ApiTags('Pro — Slots')
@ApiBearerAuth()
@Controller('pro/activities')
export class SlotController {
  constructor(
    @Inject('ISlotService')
    private readonly slotService: ISlotService,
  ) {}

  @ApiOperation({
    summary: 'Créer des créneaux pour une activité (US-19)',
    description:
      "Crée un ou plusieurs créneaux pour l'activité spécifiée. Supporte les créneaux récurrents via RRULE iCal. Rôle professionnel requis.",
  })
  @ApiParam({
    name: 'id',
    description: "L'identifiant de l'activité",
    required: true,
    type: String,
  })
  @ApiBody({
    type: CreateSlotsDto,
    description: 'Données de création des créneaux',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Créneaux créés',
    type: CreateSlotsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'RRULE invalide ou paramètres incohérents',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Activité introuvable' })
  @Post(':id/slots')
  @HttpCode(HttpStatus.CREATED)
  async createSlots(
    @Param('id') id: string,
    @Body() dto: CreateSlotsDto,
    @Req() req: { user: { sub: string; role: string } },
  ): Promise<CreateSlotsResponseDto> {
    const user = req.user;
    if (!user || user.role !== 'professionnel') {
      throw new ForbiddenException('Accès réservé aux professionnels');
    }
    return this.slotService.createSlots(id, user.sub, dto);
  }

  @ApiOperation({
    summary: "Lister les créneaux d'une activité (US-19)",
    description:
      "Retourne les créneaux de l'activité, triés par date de début croissante, avec le nombre de places encore disponibles. Réservé au professionnel propriétaire de l'activité.",
  })
  @ApiParam({
    name: 'id',
    description: "L'identifiant de l'activité",
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'month',
    description: 'Mois vise au format YYYY-MM. Par defaut : le mois courant.',
    required: false,
    example: '2026-09',
  })
  @ApiResponse({
    status: 200,
    description: 'Créneaux du mois et mois comportant des créneaux',
    type: ProSlotMonthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Mois malformé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({
    status: 403,
    description: "Accès réservé au professionnel propriétaire de l'activité",
  })
  @ApiResponse({ status: 404, description: 'Activité introuvable' })
  @Get(':id/slots')
  @HttpCode(HttpStatus.OK)
  async findSlots(
    @Param('id') id: string,
    @Req() req: { user: { sub: string; role: string } },
    @Query('month') month?: string,
  ): Promise<ProSlotMonthResponseDto> {
    const user = req.user;
    if (!user || user.role !== 'professionnel') {
      throw new ForbiddenException('Accès réservé aux professionnels');
    }

    const target = month ?? new Date().toISOString().slice(0, 7);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(target)) {
      throw new BadRequestException('Mois attendu au format YYYY-MM');
    }

    return this.slotService.findByActivityIdForOwner(id, user.sub, target);
  }
}
