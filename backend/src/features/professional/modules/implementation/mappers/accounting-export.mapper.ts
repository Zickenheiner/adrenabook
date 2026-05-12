import { Injectable } from '@nestjs/common';
import { AccountingExportEntity } from '@features/professional/domains/entities/accounting-export.entity';
import { AccountingExportDocument } from '@features/professional/domains/schemas/accounting-export.schema';

@Injectable()
export class AccountingExportMapper {
  toEntity(doc: AccountingExportDocument): AccountingExportEntity {
    const entity = new AccountingExportEntity(doc._id);
    entity.setFormat(doc.format);
    entity.setFrom(doc.from);
    entity.setTo(doc.to);
    entity.setIncludeRefunds(doc.includeRefunds);
    entity.setDeliveryMode(doc.deliveryMode);
    entity.setStatus(doc.status);
    entity.setDownloadUrl(doc.downloadUrl);
    entity.setEmailDeliveredTo(doc.emailDeliveredTo);
    entity.setRecordsCount(doc.recordsCount);
    entity.setProfessionalId(doc.professionalId);
    return entity;
  }
}
