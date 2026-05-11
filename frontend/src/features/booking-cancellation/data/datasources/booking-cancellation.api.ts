import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  CancelBookingRequestDto,
  CancelBookingResponseDto,
} from '../dtos/booking-cancellation.dto';

class BookingCancellationApi {
  async cancel(
    bookingId: string,
    data: CancelBookingRequestDto,
  ): Promise<CancelBookingResponseDto> {
    return request<CancelBookingResponseDto>({
      url: endpoints.bookingCancellation.cancel(bookingId),
      method: methods.POST,
      data,
    });
  }
}

export default BookingCancellationApi;
