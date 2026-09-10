import type { InvoiceEntity } from '../entities/invoice.entity';

export interface InvoiceRepository {
  getByBookingId(bookingId: string): Promise<InvoiceEntity>;
}
