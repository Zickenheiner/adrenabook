import type { InvoiceEntity } from '../../domain/entities/invoice.entity';
import type { InvoiceMetadataResponseDto } from '../dtos/invoice.dto';

class InvoiceMapper {
  toEntity(dto: InvoiceMetadataResponseDto): InvoiceEntity {
    return {
      invoiceNumber: dto.invoiceNumber,
      issuedAt: new Date(dto.issuedAt),
      totalEur: dto.totalEur,
      vatEur: dto.vatEur,
      downloadUrl: dto.downloadUrl,
    };
  }
}

export default InvoiceMapper;
