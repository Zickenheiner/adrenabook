import { Injectable } from '@nestjs/common';
import { CenterReviewEntity } from '@features/admin/domains/entities/center-review.entity';
import { CenterReviewDocument } from '@features/admin/domains/schemas/center-review.schema';

@Injectable()
export class CenterReviewMapper {
  toEntity(doc: CenterReviewDocument): CenterReviewEntity {
    const entity = new CenterReviewEntity(doc._id);
    entity.setCenterId(doc.centerId);
    entity.setDecision(doc.decision);
    entity.setInternalComment(doc.internalComment);
    entity.setRejectionReason(doc.rejectionReason);
    entity.setPublicComment(doc.publicComment);
    entity.setReviewedBy(doc.reviewedBy);
    entity.setNotificationSent(doc.notificationSent);
    return entity;
  }
}
