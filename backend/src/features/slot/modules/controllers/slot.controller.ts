import {
  CreateSlotsDto,
  CreateSlotsResponseDto,
  ProSlotMonthResponseDto,
  UpdateSlotDto,
} from '@features/slot/domains/dtos/slot.dto';
import { ISlotService } from '@features/slot/interfaces/services/slot.iservice';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
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
  @ApiOperation({
    summary: 'Modifier un créneau (US-19)',
    description:
      "Modifie la date/heure ou le nombre de places d'un créneau. Un créneau " +
      'déjà réservé ne peut pas être déplacé, et sa capacité ne peut pas ' +
      'descendre sous le nombre de places déjà prises.',
  })
  @ApiParam({ name: 'id', description: "L'identifiant de l'activité" })
  @ApiParam({ name: 'slotId', description: "L'identifiant du créneau" })
  @ApiBody({ type: UpdateSlotDto })
  @ApiResponse({ status: 200, description: 'Créneau modifié', type: Boolean })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès réservé au propriétaire' })
  @ApiResponse({ status: 404, description: 'Activité ou créneau introuvable' })
  @ApiResponse({
    status: 409,
    description: 'Créneau réservé : déplacement ou réduction impossible',
  })
  @Patch(':id/slots/:slotId')
  @HttpCode(HttpStatus.OK)
  async updateSlot(
    @Param('id') id: string,
    @Param('slotId') slotId: string,
    @Body() dto: UpdateSlotDto,
    @Req() req: { user: { sub: string; role: string } },
  ): Promise<boolean> {
    const user = req.user;
    if (!user || user.role !== 'professionnel') {
      throw new ForbiddenException('Accès réservé aux professionnels');
    }
    return this.slotService.updateSlotForOwner(id, slotId, user.sub, dto);
  }

  @ApiOperation({
    summary: 'Supprimer un créneau (US-19)',
    description:
      "Supprime un créneau de l'activité. Refusé tant qu'il porte des " +
      'réservations actives.',
  })
  @ApiParam({ name: 'id', description: "L'identifiant de l'activité" })
  @ApiParam({ name: 'slotId', description: "L'identifiant du créneau" })
  @ApiResponse({ status: 200, description: 'Créneau supprimé', type: Boolean })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès réservé au propriétaire' })
  @ApiResponse({ status: 404, description: 'Activité ou créneau introuvable' })
  @ApiResponse({ status: 409, description: 'Créneau réservé' })
  @Delete(':id/slots/:slotId')
  @HttpCode(HttpStatus.OK)
  async deleteSlot(
    @Param('id') id: string,
    @Param('slotId') slotId: string,
    @Req() req: { user: { sub: string; role: string } },
  ): Promise<boolean> {
    const user = req.user;
    if (!user || user.role !== 'professionnel') {
      throw new ForbiddenException('Accès réservé aux professionnels');
    }
    return this.slotService.deleteSlotForOwner(id, slotId, user.sub);
  }
}
