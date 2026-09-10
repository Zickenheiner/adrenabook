import type { BookingDetailEntity } from '../entities/booking-detail.entity';

export interface BookingDetailRepository {
  getById(id: string): Promise<BookingDetailEntity>;
}
