import { Inject, Injectable } from '@nestjs/common';
import { IWaiverService } from '../../../interfaces/services/waiver.iservice';
import { IWaiverRepository } from '@features/waiver/interfaces/repositories/waiver.irepository';
import {
  SignWaiverDto,
  SignWaiverResponseDto,
} from '@features/waiver/domains/dtos/waiver.dto';

@Injectable()
export class WaiverService implements IWaiverService {
  constructor(
    @Inject('IWaiverRepository')
    private readonly waiverRepository: IWaiverRepository,
  ) {}

  async signWaiver(
    bookingId: string,
    userId: string,
    dto: SignWaiverDto,
  ): Promise<SignWaiverResponseDto> {
    const waiver = await this.waiverRepository.sign(bookingId, userId, dto);

    return {
      waiverId: waiver.getId(),
      signedAt: waiver.getSignedAt().toISOString(),
      documentHash: waiver.getDocumentHash(),
      downloadUrl: waiver.getDownloadUrl(),
    };
  }
}
