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
    summary: 'Get a slot by ID',
    description:
      'Returns the details of a slot, including the number of remaining seats (maximum seats minus non-cancelled bookings). Accessible to any authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'The slot identifier',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The requested slot',
    type: SlotDetailResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Slot not found' })
  @Get(':id')
  async findById(@Param('id') id: string): Promise<SlotDetailResponseDto> {
    const slot = await this.slotService.findDetailById(id);
    if (!slot) {
      throw new NotFoundException('Créneau introuvable');
    }
    return slot;
  }
}
