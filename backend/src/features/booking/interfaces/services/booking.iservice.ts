import { PaymentIntentResponseDto } from '@features/booking/domains/dtos/booking.dto';
import {
  BookingDetailResponseDto,
  BookingResponseDto,
  CancelBookingDto,
  CancelBookingResponseDto,
  ConfirmPaymentDto,
  ConfirmPaymentResponseDto,
  CreateBookingDto,
} from '@features/booking/domains/dtos/booking.dto';

export interface IBookingService {
  createBooking(
    dto: CreateBookingDto,
    userId: string,
  ): Promise<BookingResponseDto>;
  getBookingDetail(
    id: string,
    userId: string,
  ): Promise<BookingDetailResponseDto>;
  /** Prepare le paiement d'une reservation et renvoie sa reference. */
  createPaymentIntent(
    id: string,
    userId: string,
  ): Promise<PaymentIntentResponseDto>;

  confirmPayment(
    id: string,
    dto: ConfirmPaymentDto,
  ): Promise<ConfirmPaymentResponseDto>;
  cancelBooking(
    id: string,
    dto: CancelBookingDto,
    userId: string,
  ): Promise<CancelBookingResponseDto>;
}
