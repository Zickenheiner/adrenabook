import { SignWaiverDto } from '@features/waiver/domains/dtos/waiver.dto';
import { WaiverEntity } from '@features/waiver/domains/entities/waiver.entity';

export interface IWaiverRepository {
  findByBookingId(bookingId: string): Promise<WaiverEntity | null>;
  sign(
    bookingId: string,
    userId: string,
    dto: SignWaiverDto,
  ): Promise<WaiverEntity>;
}
