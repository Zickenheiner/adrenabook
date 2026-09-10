import type { BookingEntity } from '../entities/booking.entity';
import type { CreateBookingRequestDto } from '../../data/dtos/booking.dto';

export interface BookingRepository {
  create(data: CreateBookingRequestDto): Promise<BookingEntity>;
}
