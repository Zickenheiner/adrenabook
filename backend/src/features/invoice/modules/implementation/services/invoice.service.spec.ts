import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { InvoiceService } from './invoice.service';
import { BookingEntity } from '@features/booking/domains/entities/booking.entity';
import { InvoiceEntity } from '@features/invoice/domains/entities/invoice.entity';

const USER_ID = '68b4d59919d9b7a94b4fde21';
const BOOKING_ID = '68b4d59919d9b7a94b4fde22';

const buildBooking = (
  status: string,
  userId: string = USER_ID,
): BookingEntity => {
  const entity = new BookingEntity(BOOKING_ID as never);
  entity.setUserId(new mongoose.Types.ObjectId(userId));
  entity.setStatus(status);
  entity.setTotalEur(180);
  entity.setVatEur(30);
  return entity;
};

const buildInvoice = (
  invoiceNumber = 'FA-2026-0001',
  issuedAt = new Date('2026-03-01T10:00:00.000Z'),
): InvoiceEntity => {
  const entity = new InvoiceEntity('invoice-1' as never);
  entity.setInvoiceNumber(invoiceNumber);
  entity.setIssuedAt(issuedAt);
  entity.setTotalEur(180);
  entity.setVatEur(30);
  return entity;
};

describe('InvoiceService', () => {
  let service: InvoiceService;
  let invoiceRepository: {
    findByBookingId: jest.Mock;
    create: jest.Mock;
    getNextInvoiceNumber: jest.Mock;
  };
  let bookingRepository: { findById: jest.Mock };

  beforeEach(async () => {
    invoiceRepository = {
      findByBookingId: jest.fn(),
      create: jest.fn(),
      getNextInvoiceNumber: jest.fn(),
    };
    bookingRepository = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: 'IInvoiceRepository', useValue: invoiceRepository },
        { provide: 'IBookingRepository', useValue: bookingRepository },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInvoiceByBookingId()', () => {
    it('should throw NotFoundException when the booking does not exist', async () => {
      bookingRepository.findById.mockResolvedValue(null);

      await expect(
        service.getInvoiceByBookingId(BOOKING_ID, USER_ID),
      ).rejects.toThrow(NotFoundException);
      expect(invoiceRepository.findByBookingId).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when the booking belongs to another user', async () => {
      bookingRepository.findById.mockResolvedValue(
        buildBooking('confirmed', '68b4d59919d9b7a94b4fde99'),
      );

      await expect(
        service.getInvoiceByBookingId(BOOKING_ID, USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when the booking is not paid', async () => {
      bookingRepository.findById.mockResolvedValue(buildBooking('pending'));

      await expect(
        service.getInvoiceByBookingId(BOOKING_ID, USER_ID),
      ).rejects.toThrow(ConflictException);
    });

    it('should return the existing invoice for a confirmed booking', async () => {
      bookingRepository.findById.mockResolvedValue(buildBooking('confirmed'));
      invoiceRepository.findByBookingId.mockResolvedValue(buildInvoice());

      const result = await service.getInvoiceByBookingId(BOOKING_ID, USER_ID);

      expect(invoiceRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual({
        invoiceNumber: 'FA-2026-0001',
        issuedAt: '2026-03-01T10:00:00.000Z',
        totalEur: 180,
        vatEur: 30,
        downloadUrl: '/invoices/FA-2026-0001.pdf',
      });
    });

    it('should accept a partially paid booking', async () => {
      bookingRepository.findById.mockResolvedValue(
        buildBooking('partial_paid'),
      );
      invoiceRepository.findByBookingId.mockResolvedValue(buildInvoice());

      await expect(
        service.getInvoiceByBookingId(BOOKING_ID, USER_ID),
      ).resolves.toBeDefined();
    });

    it('should generate a new invoice when none exists yet', async () => {
      bookingRepository.findById.mockResolvedValue(buildBooking('confirmed'));
      invoiceRepository.findByBookingId.mockResolvedValue(null);
      invoiceRepository.getNextInvoiceNumber.mockResolvedValue('FA-2026-0042');
      invoiceRepository.create.mockResolvedValue(buildInvoice('FA-2026-0042'));

      const result = await service.getInvoiceByBookingId(BOOKING_ID, USER_ID);

      expect(invoiceRepository.getNextInvoiceNumber).toHaveBeenCalledTimes(1);
      expect(invoiceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId: BOOKING_ID,
          userId: USER_ID,
          invoiceNumber: 'FA-2026-0042',
          totalEur: 180,
          vatEur: 30,
        }),
      );
      expect(result.downloadUrl).toBe('/invoices/FA-2026-0042.pdf');
    });

    it('should issue the generated invoice with an ISO date', async () => {
      bookingRepository.findById.mockResolvedValue(buildBooking('confirmed'));
      invoiceRepository.findByBookingId.mockResolvedValue(null);
      invoiceRepository.getNextInvoiceNumber.mockResolvedValue('FA-2026-0042');
      invoiceRepository.create.mockResolvedValue(buildInvoice('FA-2026-0042'));

      await service.getInvoiceByBookingId(BOOKING_ID, USER_ID);

      const dto = invoiceRepository.create.mock.calls[0][0] as {
        issuedAt: string;
      };
      expect(Number.isNaN(Date.parse(dto.issuedAt))).toBe(false);
    });

    it('should throw NotFoundException when the generation returns nothing', async () => {
      bookingRepository.findById.mockResolvedValue(buildBooking('confirmed'));
      invoiceRepository.findByBookingId.mockResolvedValue(null);
      invoiceRepository.getNextInvoiceNumber.mockResolvedValue('FA-2026-0042');
      invoiceRepository.create.mockResolvedValue(null);

      await expect(
        service.getInvoiceByBookingId(BOOKING_ID, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('should propagate a repository failure', async () => {
      bookingRepository.findById.mockResolvedValue(buildBooking('confirmed'));
      invoiceRepository.findByBookingId.mockRejectedValue(
        new Error('mongo down'),
      );

      await expect(
        service.getInvoiceByBookingId(BOOKING_ID, USER_ID),
      ).rejects.toThrow('mongo down');
    });
  });
});
