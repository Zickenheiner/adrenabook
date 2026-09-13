import { InvoiceMetadataResponseDto } from '@features/invoice/domains/dtos/invoice.dto';

export interface IInvoiceService {
  getInvoiceByBookingId(
    bookingId: string,
    userId: string,
  ): Promise<InvoiceMetadataResponseDto>;

  /** Facture rendue en PDF, prete a etre servie. */
  renderInvoicePdf(bookingId: string, userId: string): Promise<Buffer>;
}
