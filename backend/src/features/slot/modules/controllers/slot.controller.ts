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
    summary: 'Create slots for an activity',
    description:
      'Creates one or more slots for the specified activity. Supports recurring slots through an iCal RRULE. Professional role required.',
  })
  @ApiParam({
    name: 'id',
    description: 'The activity identifier',
    required: true,
    type: String,
  })
  @ApiBody({
    type: CreateSlotsDto,
    description: 'Slot creation payload',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Slots created',
    type: CreateSlotsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid RRULE or inconsistent parameters',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
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
    summary: "List an activity's slots",
    description:
      "Returns the activity's slots, sorted by ascending start date, with the number of remaining seats. Restricted to the professional who owns the activity.",
  })
  @ApiParam({
    name: 'id',
    description: 'The activity identifier',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'month',
    description:
      'Target month in YYYY-MM format. Defaults to the current month.',
    required: false,
    example: '2026-09',
  })
  @ApiResponse({
    status: 200,
    description: 'Slots for the month and the months that contain slots',
    type: ProSlotMonthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Malformed month' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Restricted to the professional who owns the activity',
  })
  @ApiResponse({ status: 404, description: 'Activity not found' })
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
    summary: 'Update a slot',
    description:
      'Updates the start date-time or the seat count of a slot. A slot that ' +
      'already carries bookings cannot be moved, and its capacity cannot drop ' +
      'below the number of seats already taken.',
  })
  @ApiParam({ name: 'id', description: 'The activity identifier' })
  @ApiParam({ name: 'slotId', description: 'The slot identifier' })
  @ApiBody({ type: UpdateSlotDto })
  @ApiResponse({ status: 200, description: 'Slot updated', type: Boolean })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Restricted to the owner' })
  @ApiResponse({ status: 404, description: 'Activity or slot not found' })
  @ApiResponse({
    status: 409,
    description: 'Slot has bookings: it cannot be moved or reduced',
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
    summary: 'Delete a slot',
    description:
      'Deletes a slot from the activity. Refused as long as it carries active ' +
      'bookings.',
  })
  @ApiParam({ name: 'id', description: 'The activity identifier' })
  @ApiParam({ name: 'slotId', description: 'The slot identifier' })
  @ApiResponse({ status: 200, description: 'Slot deleted', type: Boolean })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Restricted to the owner' })
  @ApiResponse({ status: 404, description: 'Activity or slot not found' })
  @ApiResponse({ status: 409, description: 'Slot has bookings' })
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
