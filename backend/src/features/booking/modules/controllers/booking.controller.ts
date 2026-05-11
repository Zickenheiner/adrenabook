import {
  BookingResponseDto,
  ConfirmPaymentDto,
  ConfirmPaymentResponseDto,
  CreateBookingDto,
} from '@features/booking/domains/dtos/booking.dto';
import { IBookingService } from '@features/booking/interfaces/services/booking.iservice';
import { IInvoiceService } from '@features/invoice/interfaces/services/invoice.iservice';
import { InvoiceMetadataResponseDto } from '@features/invoice/domains/dtos/invoice.dto';
import {
  Body,
  Controller,
  Get,
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

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingController {
  constructor(
    @Inject('IBookingService')
    private readonly bookingService: IBookingService,
    @Inject('IInvoiceService')
    private readonly invoiceService: IInvoiceService,
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

  @ApiOperation({
    summary: 'Confirmer le paiement Stripe (US-12)',
    description:
      "Confirme le paiement d'une reservation via un PaymentIntent Stripe. Applique un acompte de 30% (partial_paid) ou le paiement total (confirmed). Idempotent : rejet si la reservation est deja payee.",
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Identifiant de la reservation',
  })
  @ApiBody({
    type: ConfirmPaymentDto,
    description: 'PaymentIntent Stripe',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Paiement confirme',
    type: ConfirmPaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'PaymentIntent invalide ou montant incoherent',
  })
  @ApiResponse({ status: 401, description: 'Non authentifie' })
  @ApiResponse({ status: 404, description: 'Reservation introuvable' })
  @ApiResponse({
    status: 409,
    description: 'Paiement deja traite (idempotence)',
  })
  @Post(':id/confirm-payment')
  @HttpCode(HttpStatus.OK)
  async confirmPayment(
    @Param('id') id: string,
    @Body() dto: ConfirmPaymentDto,
  ): Promise<ConfirmPaymentResponseDto> {
    return this.bookingService.confirmPayment(id, dto);
  }

  @ApiOperation({
    summary: "Obtenir la facture PDF d'une réservation (US-15)",
    description:
      "Retourne les métadonnées de la facture PDF pour une réservation payée. Génère la facture automatiquement si elle n'existe pas encore. Requiert que le paiement soit complet ou partiel.",
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Identifiant de la réservation',
  })
  @ApiResponse({
    status: 200,
    description: 'Métadonnées de la facture retournées',
    type: InvoiceMetadataResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({
    status: 403,
    description: 'La réservation appartient à un autre utilisateur',
  })
  @ApiResponse({
    status: 404,
    description: 'Réservation ou facture introuvable',
  })
  @ApiResponse({
    status: 409,
    description: 'Facture non encore générée (paiement incomplet)',
  })
  @Get(':id/invoice')
  @HttpCode(HttpStatus.OK)
  async getInvoice(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } },
  ): Promise<InvoiceMetadataResponseDto> {
    return this.invoiceService.getInvoiceByBookingId(id, req.user.sub);
  }
}
