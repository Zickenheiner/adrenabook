import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type { MyBookingResponseDto } from '../dtos/my-booking.dto';

class MyBookingApi {
  async getMine(): Promise<MyBookingResponseDto[]> {
    return request<MyBookingResponseDto[]>({
      url: endpoints.bookings.mine,
      method: methods.GET,
    });
  }
}

export default MyBookingApi;
