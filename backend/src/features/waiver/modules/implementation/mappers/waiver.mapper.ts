import { WaiverEntity } from '@features/waiver/domains/entities/waiver.entity';
import { WaiverDocument } from '@features/waiver/domains/schemas/waiver.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WaiverMapper {
  toEntity(doc: WaiverDocument): WaiverEntity {
    const entity = new WaiverEntity(doc._id);
    entity.setBookingId(doc.bookingId);
    entity.setUserId(doc.userId);
    entity.setSignatureMethod(doc.signatureMethod);
    entity.setSignaturePayload(doc.signaturePayload);
    entity.setAcknowledgedRisks(doc.acknowledgedRisks);
    entity.setDocumentHash(doc.documentHash);
    entity.setSignedAt(doc.signedAt);
    entity.setDownloadUrl(doc.downloadUrl);
    return entity;
  }
}
