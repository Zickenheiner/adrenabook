import { SlotDetailResponseDto } from '@features/slot/domains/dtos/slot.dto';
import { ISlotService } from '@features/slot/interfaces/services/slot.iservice';
import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Slots')
@ApiBearerAuth()
@Controller('slots')
export class SlotDetailController {
  constructor(
    @Inject('ISlotService')
    private readonly slotService: ISlotService,
  ) {}

  @ApiOperation({
    summary: 'Récupérer un créneau par ID',
    description:
      "Retourne le détail d'un créneau, dont le nombre de places encore disponibles (places maximum moins les réservations non annulées). Accessible à tout utilisateur authentifié.",
  })
  @ApiParam({
    name: 'id',
    description: "L'identifiant du créneau",
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Le créneau demandé',
    type: SlotDetailResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Créneau introuvable' })
  @Get(':id')
  async findById(@Param('id') id: string): Promise<SlotDetailResponseDto> {
    const slot = await this.slotService.findDetailById(id);
    if (!slot) {
      throw new NotFoundException('Créneau introuvable');
    }
    return slot;
  }
}
