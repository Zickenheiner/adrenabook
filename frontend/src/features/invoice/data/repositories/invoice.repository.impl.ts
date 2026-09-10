import type { InvoiceRepository } from '../../domain/repositories/invoice.repository';
import type { InvoiceEntity } from '../../domain/entities/invoice.entity';
import InvoiceApi from '../datasources/invoice.api';
import InvoiceMapper from '../mappers/invoice.mapper';

class InvoiceRepositoryImpl implements InvoiceRepository {
  constructor(
    private readonly invoiceApi: InvoiceApi = new InvoiceApi(),
    private readonly invoiceMapper: InvoiceMapper = new InvoiceMapper(),
  ) {}

  async getByBookingId(bookingId: string): Promise<InvoiceEntity> {
    const dto = await this.invoiceApi.getByBookingId(bookingId);
    return this.invoiceMapper.toEntity(dto);
  }
}

export default InvoiceRepositoryImpl;
