import { Inject, Injectable } from '@nestjs/common';
import { IBookingService } from '../../../interfaces/services/booking.iservice';
import { IBookingRepository } from '@features/booking/interfaces/repositories/booking.irepository';
import {
  BookingResponseDto,
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
}
