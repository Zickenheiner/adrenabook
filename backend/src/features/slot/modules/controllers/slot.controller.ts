import {
  CreateSlotsDto,
  CreateSlotsResponseDto,
} from '@features/slot/domains/dtos/slot.dto';
import { ISlotService } from '@features/slot/interfaces/services/slot.iservice';
import {
  Body,
  Controller,
  ForbiddenException,
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
}
