import type { MyBookingEntity } from '../entities/my-booking.entity';

export interface MyBookingRepository {
  getMine(): Promise<MyBookingEntity[]>;
}
