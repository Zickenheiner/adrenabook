import {
  MyBookingDto,
  PaymentIntentResponseDto,
} from '@features/booking/domains/dtos/booking.dto';
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
  /** Reservations de l'utilisateur, de la plus proche a la plus lointaine. */
  findMine(userId: string): Promise<MyBookingDto[]>;

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
