import { CreateBookingDto } from '@features/booking/domains/dtos/booking.dto';
import { BookingEntity } from '@features/booking/domains/entities/booking.entity';

export interface IBookingRepository {
  create(dto: CreateBookingDto, userId: string): Promise<BookingEntity | null>;
  findById(id: string): Promise<BookingEntity | null>;
  findBySlotId(slotId: string): Promise<BookingEntity[] | null>;
}
