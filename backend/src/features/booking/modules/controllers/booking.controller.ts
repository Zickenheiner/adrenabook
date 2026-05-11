import {
  BookingResponseDto,
  CreateBookingDto,
} from '@features/booking/domains/dtos/booking.dto';
import { IBookingService } from '@features/booking/interfaces/services/booking.iservice';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingController {
  constructor(
    @Inject('IBookingService')
    private readonly bookingService: IBookingService,
  ) {}

  @ApiOperation({
    summary: 'Réserver un créneau (US-11)',
    description:
      "Crée une réservation pour un créneau d'activité. Vérifie les places disponibles en temps réel et bloque la réservation 15 minutes en attente de paiement.",
  })
  @ApiBody({
    type: CreateBookingDto,
    description: 'Données de réservation',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Réservation créée, en attente paiement',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Prérequis non respectés ou validation échouée',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Créneau introuvable' })
  @ApiResponse({ status: 409, description: 'Plus assez de places disponibles' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @Body() dto: CreateBookingDto,
    @Req() req: { user: { sub: string } },
  ): Promise<BookingResponseDto> {
    return this.bookingService.createBooking(dto, req.user.sub);
  }
}
