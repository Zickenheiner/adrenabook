import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  CreateBookingRequestDto,
  BookingResponseDto,
} from '../dtos/booking.dto';

class BookingApi {
  constructor(private readonly baseUrl: string = endpoints.bookings.base) {}

  async create(data: CreateBookingRequestDto): Promise<BookingResponseDto> {
    return request<BookingResponseDto>({
      url: this.baseUrl,
      method: methods.POST,
      data,
    });
  }
}

export default BookingApi;
