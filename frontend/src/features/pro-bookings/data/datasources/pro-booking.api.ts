import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type { ProBookingResponseDto } from '../dtos/pro-booking.dto';

class ProBookingApi {
  async getByCenter(centerId: string): Promise<ProBookingResponseDto[]> {
    return request<ProBookingResponseDto[]>({
      url: endpoints.proBookings.byCenter(centerId),
      method: methods.GET,
    });
  }
}

export default ProBookingApi;
