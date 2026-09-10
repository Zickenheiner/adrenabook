import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IInvoiceService } from '../../../interfaces/services/invoice.iservice';
import { IInvoiceRepository } from '@features/invoice/interfaces/repositories/invoice.irepository';
import { IBookingRepository } from '@features/booking/interfaces/repositories/booking.irepository';
import { InvoiceMetadataResponseDto } from '@features/invoice/domains/dtos/invoice.dto';

@Injectable()
export class InvoiceService implements IInvoiceService {
  constructor(
    @Inject('IInvoiceRepository')
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject('IBookingRepository')
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async getInvoiceByBookingId(
    bookingId: string,
    userId: string,
  ): Promise<InvoiceMetadataResponseDto> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Réservation introuvable');
    }

    if (booking.getUserId().toString() !== userId) {
      throw new ForbiddenException(
        'Cette réservation appartient à un autre utilisateur',
      );
    }

    const paidStatuses = ['confirmed', 'partial_paid'];
    if (!paidStatuses.includes(booking.getStatus())) {
      throw new ConflictException(
        'Facture non encore générée (paiement incomplet)',
      );
    }

    // Return existing invoice or generate a new one
    let invoice = await this.invoiceRepository.findByBookingId(bookingId);
    if (!invoice) {
      const invoiceNumber = await this.invoiceRepository.getNextInvoiceNumber();
      invoice = await this.invoiceRepository.create({
        bookingId,
        userId,
        invoiceNumber,
        issuedAt: new Date().toISOString(),
        totalEur: booking.getTotalEur(),
        vatEur: booking.getVatEur(),
      });
    }

    if (!invoice) {
      throw new NotFoundException('Facture introuvable');
    }

    const downloadUrl = `/invoices/${invoice.getInvoiceNumber()}.pdf`;

    return {
      invoiceNumber: invoice.getInvoiceNumber(),
      issuedAt: invoice.getIssuedAt().toISOString(),
      totalEur: invoice.getTotalEur(),
      vatEur: invoice.getVatEur(),
      downloadUrl,
    };
  }
}
