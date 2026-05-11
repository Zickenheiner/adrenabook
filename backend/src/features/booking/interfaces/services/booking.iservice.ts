import {
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
