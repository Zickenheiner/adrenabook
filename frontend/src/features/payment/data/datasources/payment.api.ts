import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  ConfirmPaymentRequestDto,
  ConfirmPaymentResponseDto,
} from '../dtos/payment.dto';

class PaymentApi {
  async confirmPayment(
    bookingId: string,
    data: ConfirmPaymentRequestDto,
  ): Promise<ConfirmPaymentResponseDto> {
    return request<ConfirmPaymentResponseDto>({
      url: endpoints.payment.confirmPayment(bookingId),
      method: methods.POST,
      data,
    });
  }
}

export default PaymentApi;
