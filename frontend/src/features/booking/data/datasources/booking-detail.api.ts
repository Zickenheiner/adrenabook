import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type { BookingDetailResponseDto } from '../dtos/booking-detail.dto';

class BookingDetailApi {
  async getById(id: string): Promise<BookingDetailResponseDto> {
    return request<BookingDetailResponseDto>({
      url: endpoints.bookings.byId(id),
      method: methods.GET,
    });
  }
}

export default BookingDetailApi;
