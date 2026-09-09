import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BookingController } from './booking.controller';
import { IBookingService } from '@features/booking/interfaces/services/booking.iservice';
import { IInvoiceService } from '@features/invoice/interfaces/services/invoice.iservice';
import {
  BookingDetailResponseDto,
  BookingResponseDto,
  CancelBookingDto,
  CancelBookingResponseDto,
  ConfirmPaymentDto,
  ConfirmPaymentResponseDto,
  CreateBookingDto,
} from '@features/booking/domains/dtos/booking.dto';
import { InvoiceMetadataResponseDto } from '@features/invoice/domains/dtos/invoice.dto';

describe('BookingController', () => {
  let controller: BookingController;
  let bookingService: jest.Mocked<IBookingService>;
  let invoiceService: jest.Mocked<IInvoiceService>;

  const userId = '68b4d59919d9b7a94b4fde10';
  const bookingId = '68b4d59919d9b7a94b4fde21';

  // Requete authentifiee minimale telle que fournie par le guard JWT
  const buildRequest = (sub: string = userId): { user: { sub: string } } => ({
    user: { sub },
  });

  beforeEach(async () => {
    const bookingServiceMock: jest.Mocked<IBookingService> = {
      createBooking: jest.fn(),
      getBookingDetail: jest.fn(),
      confirmPayment: jest.fn(),
      cancelBooking: jest.fn(),
    };

    const invoiceServiceMock: jest.Mocked<IInvoiceService> = {
      getInvoiceByBookingId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: 'IBookingService',
          useValue: bookingServiceMock,
        },
        {
          provide: 'IInvoiceService',
          useValue: invoiceServiceMock,
        },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);
    bookingService = module.get('IBookingService');
    invoiceService = module.get('IInvoiceService');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createBooking()', () => {
    const dto: CreateBookingDto = {
      slotId: '68b4d59919d9b7a94b4fde22',
      participants: [
        { firstName: 'Jean', lastName: 'Dupont', birthDate: '1990-05-15' },
      ],
      acceptCenterTerms: true,
    };

    const expected: BookingResponseDto = {
      bookingId,
      status: 'pending_payment',
      reservationExpiresAt: '2026-06-15T09:15:00.000Z',
      totalEur: 120,
      vatEur: 20,
      paymentIntentClientSecret: 'pi_123_secret_456',
    };

    it('should create the booking for the authenticated user', async () => {
      bookingService.createBooking.mockResolvedValue(expected);

      const result = await controller.createBooking(dto, buildRequest());

      expect(result).toEqual(expected);
      expect(bookingService.createBooking).toHaveBeenCalledWith(dto, userId);
      expect(bookingService.createBooking).toHaveBeenCalledTimes(1);
    });

    it('should propagate a ConflictException when the slot is full', async () => {
      bookingService.createBooking.mockRejectedValue(
        new ConflictException('Plus assez de places disponibles'),
      );

      await expect(
        controller.createBooking(dto, buildRequest()),
      ).rejects.toThrow(ConflictException);
    });

    it('should propagate a NotFoundException when the slot does not exist', async () => {
      bookingService.createBooking.mockRejectedValue(
        new NotFoundException('Créneau introuvable'),
      );

      await expect(
        controller.createBooking(dto, buildRequest()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBooking()', () => {
    const expected: BookingDetailResponseDto = {
      bookingId,
      status: 'pending_payment',
      reservationExpiresAt: '2026-06-15T09:15:00.000Z',
      totalEur: 120,
      vatEur: 20,
      participants: [{ firstName: 'Jean', lastName: 'Dupont' }],
      activityTitle: 'Saut en parachute',
      slotStartAt: '2026-06-15T09:00:00.000Z',
      waiverSigned: false,
    };

    it('should return the booking detail of the owner', async () => {
      bookingService.getBookingDetail.mockResolvedValue(expected);

      const result = await controller.getBooking(bookingId, buildRequest());

      expect(result).toEqual(expected);
      expect(bookingService.getBookingDetail).toHaveBeenCalledWith(
        bookingId,
        userId,
      );
    });

    it('should not expose any Stripe client secret', async () => {
      bookingService.getBookingDetail.mockResolvedValue(expected);

      const result = await controller.getBooking(bookingId, buildRequest());

      expect(result).not.toHaveProperty('paymentIntentClientSecret');
    });

    it('should forward the authenticated user id from the request', async () => {
      bookingService.getBookingDetail.mockResolvedValue(expected);

      await controller.getBooking(bookingId, buildRequest('another-user'));

      expect(bookingService.getBookingDetail).toHaveBeenCalledWith(
        bookingId,
        'another-user',
      );
    });

    it('should propagate a ForbiddenException when the booking belongs to someone else', async () => {
      bookingService.getBookingDetail.mockRejectedValue(
        new ForbiddenException(
          'Réservation appartenant à un autre utilisateur',
        ),
      );

      await expect(
        controller.getBooking(bookingId, buildRequest()),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should propagate a NotFoundException when the booking does not exist', async () => {
      bookingService.getBookingDetail.mockRejectedValue(
        new NotFoundException('Réservation introuvable'),
      );

      await expect(
        controller.getBooking('unknown', buildRequest()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirmPayment()', () => {
    const dto: ConfirmPaymentDto = { paymentIntentId: 'pi_123' };

    const expected: ConfirmPaymentResponseDto = {
      bookingId,
      status: 'partial_paid',
      paidAmountEur: 36,
      remainingAmountEur: 84,
      finalPaymentDueAt: '2026-06-08T09:00:00.000Z',
    };

    it('should confirm the payment and return the payment summary', async () => {
      bookingService.confirmPayment.mockResolvedValue(expected);

      const result = await controller.confirmPayment(bookingId, dto);

      expect(result).toEqual(expected);
      expect(bookingService.confirmPayment).toHaveBeenCalledWith(
        bookingId,
        dto,
      );
    });

    it('should return a "confirmed" status for a full payment', async () => {
      const fullPayment: ConfirmPaymentResponseDto = {
        bookingId,
        status: 'confirmed',
        paidAmountEur: 120,
        remainingAmountEur: 0,
      };
      bookingService.confirmPayment.mockResolvedValue(fullPayment);

      const result = await controller.confirmPayment(bookingId, dto);

      expect(result.status).toBe('confirmed');
      expect(result.remainingAmountEur).toBe(0);
    });

    it('should propagate a ConflictException when the payment is already processed', async () => {
      bookingService.confirmPayment.mockRejectedValue(
        new ConflictException('Paiement déjà traité'),
      );

      await expect(controller.confirmPayment(bookingId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should propagate a NotFoundException when the booking does not exist', async () => {
      bookingService.confirmPayment.mockRejectedValue(
        new NotFoundException('Réservation introuvable'),
      );

      await expect(controller.confirmPayment('unknown', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getInvoice()', () => {
    const expected: InvoiceMetadataResponseDto = {
      invoiceNumber: 'INV-2026-0001',
      issuedAt: '2026-06-15T10:00:00.000Z',
      totalEur: 120,
      vatEur: 20,
      downloadUrl: 'https://example.test/invoices/INV-2026-0001.pdf',
    };

    it('should return the invoice metadata from the invoice service', async () => {
      invoiceService.getInvoiceByBookingId.mockResolvedValue(expected);

      const result = await controller.getInvoice(bookingId, buildRequest());

      expect(result).toEqual(expected);
      expect(invoiceService.getInvoiceByBookingId).toHaveBeenCalledWith(
        bookingId,
        userId,
      );
    });

    it('should not delegate to the booking service', async () => {
      invoiceService.getInvoiceByBookingId.mockResolvedValue(expected);

      await controller.getInvoice(bookingId, buildRequest());

      expect(bookingService.getBookingDetail).not.toHaveBeenCalled();
    });

    it('should propagate a ConflictException when the invoice is not generated yet', async () => {
      invoiceService.getInvoiceByBookingId.mockRejectedValue(
        new ConflictException('Facture non encore générée'),
      );

      await expect(
        controller.getInvoice(bookingId, buildRequest()),
      ).rejects.toThrow(ConflictException);
    });

    it('should propagate a ForbiddenException when the booking belongs to someone else', async () => {
      invoiceService.getInvoiceByBookingId.mockRejectedValue(
        new ForbiddenException(
          'Réservation appartenant à un autre utilisateur',
        ),
      );

      await expect(
        controller.getInvoice(bookingId, buildRequest()),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cancelBooking()', () => {
    const dto: CancelBookingDto = {
      reason: 'personal',
      comment: 'Empêchement de dernière minute',
    };

    const expected: CancelBookingResponseDto = {
      bookingId,
      status: 'cancelled',
      refundedAmountEur: 120,
      refundPolicyApplied: 'full',
      refundEta: 'Remboursement effectué sous 5 à 10 jours ouvrés',
    };

    it('should cancel the booking of the authenticated user', async () => {
      bookingService.cancelBooking.mockResolvedValue(expected);

      const result = await controller.cancelBooking(
        bookingId,
        dto,
        buildRequest(),
      );

      expect(result).toEqual(expected);
      expect(bookingService.cancelBooking).toHaveBeenCalledWith(
        bookingId,
        dto,
        userId,
      );
    });

    it('should return a "none" refund policy when the cancellation is too late', async () => {
      bookingService.cancelBooking.mockResolvedValue({
        ...expected,
        refundedAmountEur: 0,
        refundPolicyApplied: 'none',
      });

      const result = await controller.cancelBooking(
        bookingId,
        dto,
        buildRequest(),
      );

      expect(result.refundPolicyApplied).toBe('none');
      expect(result.refundedAmountEur).toBe(0);
    });

    it('should propagate a ConflictException when the booking is already cancelled', async () => {
      bookingService.cancelBooking.mockRejectedValue(
        new ConflictException('Déjà annulée'),
      );

      await expect(
        controller.cancelBooking(bookingId, dto, buildRequest()),
      ).rejects.toThrow(ConflictException);
    });

    it('should propagate a ForbiddenException when the booking belongs to someone else', async () => {
      bookingService.cancelBooking.mockRejectedValue(
        new ForbiddenException(
          'Réservation appartenant à un autre utilisateur',
        ),
      );

      await expect(
        controller.cancelBooking(bookingId, dto, buildRequest()),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should propagate a NotFoundException when the booking does not exist', async () => {
      bookingService.cancelBooking.mockRejectedValue(
        new NotFoundException('Réservation introuvable'),
      );

      await expect(
        controller.cancelBooking('unknown', dto, buildRequest()),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
