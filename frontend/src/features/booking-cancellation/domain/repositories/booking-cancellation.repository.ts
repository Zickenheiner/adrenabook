import type { BookingCancellationEntity } from '../entities/booking-cancellation.entity';
import type { CancelBookingRequestDto } from '../../data/dtos/booking-cancellation.dto';

export interface BookingCancellationRepository {
  cancel(
    bookingId: string,
    data: CancelBookingRequestDto,
  ): Promise<BookingCancellationEntity>;
}
