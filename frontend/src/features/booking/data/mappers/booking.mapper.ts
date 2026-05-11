import type { BookingEntity } from '../../domain/entities/booking.entity';
import type { BookingResponseDto } from '../dtos/booking.dto';

class BookingMapper {
  toEntity(dto: BookingResponseDto): BookingEntity {
    return {
      bookingId: dto.bookingId,
      status: dto.status,
      reservationExpiresAt: new Date(dto.reservationExpiresAt),
      totalEur: dto.totalEur,
      vatEur: dto.vatEur,
      paymentIntentClientSecret: dto.paymentIntentClientSecret,
    };
  }
}

export default BookingMapper;
