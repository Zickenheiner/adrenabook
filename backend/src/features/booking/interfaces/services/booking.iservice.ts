import {
  BookingResponseDto,
  CreateBookingDto,
} from '@features/booking/domains/dtos/booking.dto';

export interface IBookingService {
  createBooking(
    dto: CreateBookingDto,
    userId: string,
  ): Promise<BookingResponseDto>;
}
