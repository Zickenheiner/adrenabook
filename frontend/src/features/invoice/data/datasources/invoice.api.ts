import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type { InvoiceMetadataResponseDto } from '../dtos/invoice.dto';

class InvoiceApi {
  async getByBookingId(bookingId: string): Promise<InvoiceMetadataResponseDto> {
    return request<InvoiceMetadataResponseDto>({
      url: endpoints.invoice.byBookingId(bookingId),
      method: methods.GET,
    });
  }
}

export default InvoiceApi;
