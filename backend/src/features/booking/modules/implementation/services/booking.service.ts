import { Inject, Injectable } from '@nestjs/common';
import { IBookingService } from '../../../interfaces/services/booking.iservice';
import { IBookingRepository } from '@features/booking/interfaces/repositories/booking.irepository';
import {
  BookingResponseDto,
  CancelBookingDto,
  CancelBookingResponseDto,
  ConfirmPaymentDto,
  ConfirmPaymentResponseDto,
  CreateBookingDto,
} from '@features/booking/domains/dtos/booking.dto';

@Injectable()
export class BookingService implements IBookingService {
  constructor(
    @Inject('IBookingRepository')
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async createBooking(
    dto: CreateBookingDto,
    userId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.create(dto, userId);

    return {
      bookingId: booking!.getId(),
      status: 'pending_payment',
      reservationExpiresAt: booking!.getReservationExpiresAt().toISOString(),
      totalEur: booking!.getTotalEur(),
      vatEur: booking!.getVatEur(),
      paymentIntentClientSecret: booking!.getPaymentIntentClientSecret(),
    };
  }

  async confirmPayment(
    id: string,
    dto: ConfirmPaymentDto,
  ): Promise<ConfirmPaymentResponseDto> {
    return this.bookingRepository.confirmPayment(id, dto);
  }

  async cancelBooking(
    id: string,
    dto: CancelBookingDto,
    userId: string,
  ): Promise<CancelBookingResponseDto> {
    return this.bookingRepository.cancelBooking(id, dto, userId);
  }
}
