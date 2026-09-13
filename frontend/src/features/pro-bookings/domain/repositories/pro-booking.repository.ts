import type { ProBookingEntity } from '../entities/pro-booking.entity';

export interface ProBookingRepository {
  getByCenter(centerId: string): Promise<ProBookingEntity[]>;
}
