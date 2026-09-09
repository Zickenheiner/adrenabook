import type { WaiverEntity } from '../../domain/entities/waiver.entity';
import type { SignWaiverResponseDto } from '../dtos/waiver.dto';

class WaiverMapper {
  toEntity(dto: SignWaiverResponseDto): WaiverEntity {
    return {
      waiverId: dto.waiverId,
      signedAt: new Date(dto.signedAt),
      documentHash: dto.documentHash,
      downloadUrl: dto.downloadUrl ?? null,
    };
  }
}

export default WaiverMapper;
