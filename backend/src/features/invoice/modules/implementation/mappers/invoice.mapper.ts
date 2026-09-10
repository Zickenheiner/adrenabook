import { InvoiceEntity } from '@features/invoice/domains/entities/invoice.entity';
import { InvoiceDocument } from '@features/invoice/domains/schemas/invoice.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InvoiceMapper {
  toEntity(doc: InvoiceDocument): InvoiceEntity {
    const entity = new InvoiceEntity(doc._id);
    entity.setBookingId(doc.bookingId);
    entity.setUserId(doc.userId);
    entity.setInvoiceNumber(doc.invoiceNumber);
    entity.setIssuedAt(doc.issuedAt);
    entity.setTotalEur(doc.totalEur);
    entity.setVatEur(doc.vatEur);
    return entity;
  }
}
