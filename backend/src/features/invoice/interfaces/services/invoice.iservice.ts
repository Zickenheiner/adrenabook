import { InvoiceMetadataResponseDto } from '@features/invoice/domains/dtos/invoice.dto';

export interface IInvoiceService {
  getInvoiceByBookingId(
    bookingId: string,
    userId: string,
  ): Promise<InvoiceMetadataResponseDto>;
}
