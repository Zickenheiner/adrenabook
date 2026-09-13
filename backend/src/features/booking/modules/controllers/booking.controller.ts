import {
  BookingDetailResponseDto,
  BookingResponseDto,
  CancelBookingDto,
  CancelBookingResponseDto,
  ConfirmPaymentDto,
  ConfirmPaymentResponseDto,
  CreateBookingDto,
  MyBookingDto,
  PaymentIntentResponseDto,
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
    summary: 'Récupérer une réservation',
    description:
      "Retourne l'état d'une réservation et le récapitulatif nécessaire à la page de confirmation (participants, activité, créneau, décharge). Réservé au propriétaire de la réservation. Le client secret Stripe n'est jamais exposé par cette route.",
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Identifiant de la réservation',
  })
  @ApiResponse({
    status: 200,
    description: 'Détail de la réservation',
    type: BookingDetailResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({
    status: 403,
    description: 'La réservation appartient à un autre utilisateur',
  })
  @ApiResponse({ status: 404, description: 'Réservation introuvable' })
  @ApiOperation({
    summary: 'Lister ses réservations',
    description:
      "Retourne les réservations de l'utilisateur authentifié, de la plus proche à la plus ancienne, tous statuts confondus.",
  })
  @ApiResponse({
    status: 200,
    description: "Réservations de l'utilisateur",
    type: [MyBookingDto],
  })
  @Get('me')
  async findMine(
    @Req() req: { user: { sub: string } },
  ): Promise<MyBookingDto[]> {
    return this.bookingService.findMine(req.user.sub);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBooking(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } },
  ): Promise<BookingDetailResponseDto> {
    return this.bookingService.getBookingDetail(id, req.user.sub);
  }

  @ApiOperation({
    summary: 'Confirmer le paiement Stripe (US-12)',
    description:
      "Confirme le paiement d'une reservation. Le montant est regle en une fois : la reservation passe en confirmed. Idempotent : rejet si la reservation est deja payee.",
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
  @ApiOperation({
    summary: "Préparer le paiement d'une réservation",
    description:
      "Renvoie la référence à présenter à la confirmation. En attendant l'intégration Stripe, elle est simulée : `simulated` vaut true et aucun encaissement n'a lieu.",
  })
  @ApiParam({ name: 'id', description: 'Identifiant de la réservation' })
  @ApiResponse({
    status: 201,
    description: 'Référence de paiement',
    type: PaymentIntentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Réservation non payable' })
  @ApiResponse({ status: 403, description: 'Réservation détenue par un autre' })
  @ApiResponse({ status: 404, description: 'Réservation introuvable' })
  @Post(':id/payment-intent')
  async createPaymentIntent(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } },
  ): Promise<PaymentIntentResponseDto> {
    return this.bookingService.createPaymentIntent(id, req.user.sub);
  }

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

  @ApiOperation({
    summary: 'Annuler une réservation (US-13)',
    description:
      'Annule une réservation et déclenche un remboursement Stripe automatique selon les CGV du centre : remboursement 100% si > J-15, 50% entre J-7 et J-15, 0% si < J-7.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Identifiant de la réservation',
  })
  @ApiBody({
    type: CancelBookingDto,
    description: "Motif et commentaire d'annulation",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Annulation traitée',
    type: CancelBookingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation échouée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({
    status: 403,
    description: 'Réservation appartient à un autre utilisateur',
  })
  @ApiResponse({ status: 404, description: 'Réservation introuvable' })
  @ApiResponse({
    status: 409,
    description: 'Déjà annulée ou activité déjà réalisée',
  })
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelBooking(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @Req() req: { user: { sub: string } },
  ): Promise<CancelBookingResponseDto> {
    return this.bookingService.cancelBooking(id, dto, req.user.sub);
  }
}
