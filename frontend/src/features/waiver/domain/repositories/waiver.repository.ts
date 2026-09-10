import type { WaiverEntity } from '../entities/waiver.entity';
import type { SignWaiverRequestDto } from '../../data/dtos/waiver.dto';

export interface WaiverRepository {
  sign(bookingId: string, data: SignWaiverRequestDto): Promise<WaiverEntity>;
}
