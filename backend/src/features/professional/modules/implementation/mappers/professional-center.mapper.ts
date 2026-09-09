import { Injectable } from '@nestjs/common';
import { ProfessionalCenterEntity } from '@features/professional/domains/entities/professional-center.entity';
import { ProfessionalCenterDocument } from '@features/professional/domains/schemas/professional-center.schema';

@Injectable()
export class ProfessionalCenterMapper {
  toEntity(doc: ProfessionalCenterDocument): ProfessionalCenterEntity {
    const entity = new ProfessionalCenterEntity(doc._id);
    entity.setOwnerId(doc.ownerId);
    entity.setCompanyName(doc.companyName);
    entity.setSiret(doc.siret);
    entity.setContactEmail(doc.contactEmail);
    entity.setContactPhone(doc.contactPhone);
    entity.setAddress(doc.address);
    entity.setLegalRepresentative(doc.legalRepresentative);
    entity.setDocuments(doc.documents);
    entity.setStatus(doc.status);
    return entity;
  }
}
