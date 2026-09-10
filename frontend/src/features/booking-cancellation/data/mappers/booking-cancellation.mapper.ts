import type { BookingCancellationEntity } from '../../domain/entities/booking-cancellation.entity';
import type { CancelBookingResponseDto } from '../dtos/booking-cancellation.dto';

class BookingCancellationMapper {
  toEntity(dto: CancelBookingResponseDto): BookingCancellationEntity {
    return {
      bookingId: dto.bookingId,
      status: dto.status,
      refundedAmountEur: dto.refundedAmountEur,
      refundPolicyApplied: dto.refundPolicyApplied,
      refundEta: dto.refundEta,
    };
  }
}

export default BookingCancellationMapper;
