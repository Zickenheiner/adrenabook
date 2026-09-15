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
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import type { Response } from 'express';

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
    summary: 'Book a slot',
    description:
      'Creates a booking for an activity slot. Checks the remaining seats in real time and holds the booking for 15 minutes pending payment.',
  })
  @ApiBody({
    type: CreateBookingDto,
    description: 'Booking data',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Booking created, pending payment',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Prerequisites not met or validation failed',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Slot not found' })
  @ApiResponse({ status: 409, description: 'Not enough remaining seats' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @Body() dto: CreateBookingDto,
    @Req() req: { user: { sub: string } },
  ): Promise<BookingResponseDto> {
    return this.bookingService.createBooking(dto, req.user.sub);
  }

  @ApiOperation({
    summary: 'Get a booking',
    description:
      'Returns the state of a booking and the summary needed by the confirmation page (participants, activity, slot, waiver). Restricted to the owner of the booking. The Stripe client secret is never exposed by this route.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Booking identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking details',
    type: BookingDetailResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'The booking belongs to another user',
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiOperation({
    summary: 'List your own bookings',
    description:
      'Returns the bookings of the authenticated user, from the nearest to the oldest, whatever their status.',
  })
  @ApiResponse({
    status: 200,
    description: "The user's bookings",
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
    summary: 'Confirm the Stripe payment',
    description:
      'Confirms the payment of a booking. The amount is paid in one go: the booking moves to confirmed. Idempotent: rejected if the booking is already paid.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Booking identifier',
  })
  @ApiBody({
    type: ConfirmPaymentDto,
    description: 'Stripe PaymentIntent',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed',
    type: ConfirmPaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid PaymentIntent or inconsistent amount',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({
    status: 409,
    description: 'Payment already processed (idempotency)',
  })
  @ApiOperation({
    summary: 'Prepare the payment of a booking',
    description:
      'Returns the reference to present at confirmation. Pending the Stripe integration, it is simulated: `simulated` is true and no payment is collected.',
  })
  @ApiParam({ name: 'id', description: 'Booking identifier' })
  @ApiResponse({
    status: 201,
    description: 'Payment reference',
    type: PaymentIntentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Booking is not payable' })
  @ApiResponse({ status: 403, description: 'Booking owned by another user' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
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
    summary: 'Get the PDF invoice of a booking',
    description:
      'Returns the metadata of the PDF invoice for a paid booking. Generates the invoice automatically if it does not exist yet. Requires the payment to be complete or partial.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Booking identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice metadata returned',
    type: InvoiceMetadataResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'The booking belongs to another user',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking or invoice not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Invoice not generated yet (incomplete payment)',
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
    summary: 'Download the PDF invoice of a booking',
    description:
      'Returns the PDF document. Same conditions as its metadata: the booking must belong to the requester and be paid.',
  })
  @ApiParam({ name: 'id', description: 'Booking identifier' })
  @ApiResponse({ status: 200, description: 'PDF document' })
  @Get(':id/invoice/pdf')
  async getInvoicePdf(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } },
    @Res() res: Response,
  ): Promise<void> {
    const pdf = await this.invoiceService.renderInvoicePdf(id, req.user.sub);
    const { invoiceNumber } = await this.invoiceService.getInvoiceByBookingId(
      id,
      req.user.sub,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdf.length);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="facture-${invoiceNumber}.pdf"`,
    );
    res.end(pdf);
  }

  @ApiOperation({
    summary: 'Cancel a booking',
    description:
      "Cancels a booking and triggers an automatic Stripe refund according to the center's terms and conditions: 100% refund more than 15 days before, 50% between 7 and 15 days before, 0% less than 7 days before.",
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Booking identifier',
  })
  @ApiBody({
    type: CancelBookingDto,
    description: 'Cancellation reason and comment',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Cancellation processed',
    type: CancelBookingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'The booking belongs to another user',
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({
    status: 409,
    description: 'Already cancelled or activity already completed',
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
