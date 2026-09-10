import { CreateInvoiceDto } from '@features/invoice/domains/dtos/invoice.dto';
import { InvoiceEntity } from '@features/invoice/domains/entities/invoice.entity';

export interface IInvoiceRepository {
  findByBookingId(bookingId: string): Promise<InvoiceEntity | null>;
  create(dto: CreateInvoiceDto): Promise<InvoiceEntity | null>;
  getNextInvoiceNumber(): Promise<string>;
}
