import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  SignWaiverRequestDto,
  SignWaiverResponseDto,
} from '../dtos/waiver.dto';

class WaiverApi {
  async sign(
    bookingId: string,
    data: SignWaiverRequestDto,
  ): Promise<SignWaiverResponseDto> {
    return request<SignWaiverResponseDto>({
      url: endpoints.waiver.sign(bookingId),
      method: methods.POST,
      data,
    });
  }
}

export default WaiverApi;
