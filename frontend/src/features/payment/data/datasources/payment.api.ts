import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  ConfirmPaymentRequestDto,
  ConfirmPaymentResponseDto,
  PaymentIntentResponseDto,
} from '../dtos/payment.dto';

class PaymentApi {
  async createIntent(bookingId: string): Promise<PaymentIntentResponseDto> {
    return request<PaymentIntentResponseDto>({
      url: endpoints.payment.intent(bookingId),
      method: methods.POST,
    });
  }

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
