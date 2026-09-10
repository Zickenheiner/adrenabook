import {
  SignWaiverDto,
  SignWaiverResponseDto,
} from '@features/waiver/domains/dtos/waiver.dto';

export interface IWaiverService {
  signWaiver(
    bookingId: string,
    userId: string,
    dto: SignWaiverDto,
  ): Promise<SignWaiverResponseDto>;
}
