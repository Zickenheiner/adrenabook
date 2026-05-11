import type {
  CenterReviewEntity,
  PendingCenterEntity,
} from '../../domain/entities/center-review.entity';
import type {
  ReviewCenterResponseDto,
  PendingCenterDto,
} from '../dtos/center-review.dto';

class CenterReviewMapper {
  toEntity(dto: ReviewCenterResponseDto): CenterReviewEntity {
    return {
      centerId: dto.centerId,
      newStatus: dto.newStatus,
      reviewedAt: new Date(dto.reviewedAt),
      reviewedBy: dto.reviewedBy,
      notificationSent: dto.notificationSent,
    };
  }

  toPendingCenterEntity(dto: PendingCenterDto): PendingCenterEntity {
    return {
      id: dto.id,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      submittedAt: new Date(dto.submittedAt),
      kbisUrl: dto.kbisUrl,
      diplomaUrl: dto.diplomaUrl,
      insuranceUrl: dto.insuranceUrl,
      description: dto.description,
    };
  }

  toPendingCenterEntityList(dtos: PendingCenterDto[]): PendingCenterEntity[] {
    return dtos.map((dto) => this.toPendingCenterEntity(dto));
  }
}

export default CenterReviewMapper;
