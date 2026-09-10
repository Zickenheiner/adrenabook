import type { BookingCancellationRepository } from '../../domain/repositories/booking-cancellation.repository';
import type { BookingCancellationEntity } from '../../domain/entities/booking-cancellation.entity';
import type { CancelBookingRequestDto } from '../dtos/booking-cancellation.dto';
import BookingCancellationApi from '../datasources/booking-cancellation.api';
import BookingCancellationMapper from '../mappers/booking-cancellation.mapper';

class BookingCancellationRepositoryImpl implements BookingCancellationRepository {
  constructor(
    private readonly api: BookingCancellationApi = new BookingCancellationApi(),
    private readonly mapper: BookingCancellationMapper = new BookingCancellationMapper(),
  ) {}

  async cancel(
    bookingId: string,
    data: CancelBookingRequestDto,
  ): Promise<BookingCancellationEntity> {
    const dto = await this.api.cancel(bookingId, data);
    return this.mapper.toEntity(dto);
  }
}

export default BookingCancellationRepositoryImpl;
