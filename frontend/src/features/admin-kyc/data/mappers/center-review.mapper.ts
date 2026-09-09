import type {
  CenterDocumentRef,
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
    const documents: CenterDocumentRef[] = [];
    if (dto.kbisFileId) {
      documents.push({ label: 'Extrait Kbis', fileId: dto.kbisFileId });
    }
    if (dto.rcProFileId) {
      documents.push({ label: 'Attestation RC Pro', fileId: dto.rcProFileId });
    }
    (dto.instructorDiplomaFileIds ?? []).forEach((fileId, i, tous) => {
      documents.push({
        label: tous.length > 1 ? `Diplôme ${i + 1}` : 'Diplôme encadrant',
        fileId,
      });
    });

    return {
      id: dto.id,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      siret: dto.siret,
      city: dto.city,
      status: dto.status,
      submittedAt: new Date(dto.submittedAt),
      documents,
    };
  }

  toPendingCenterEntityList(dtos: PendingCenterDto[]): PendingCenterEntity[] {
    return dtos.map((dto) => this.toPendingCenterEntity(dto));
  }
}

export default CenterReviewMapper;
