import { Injectable } from '@nestjs/common';
import { CsvImportEntity } from '@features/professional/domains/entities/csv-import.entity';
import { CsvImportDocument } from '@features/professional/domains/schemas/csv-import.schema';

@Injectable()
export class CsvImportMapper {
  toEntity(doc: CsvImportDocument): CsvImportEntity {
    const entity = new CsvImportEntity(doc._id);
    entity.setEntityType(doc.entityType);
    entity.setFileId(doc.fileId);
    entity.setColumnMapping(Object.fromEntries(doc.columnMapping));
    entity.setDryRun(doc.dryRun);
    entity.setStatus(doc.status);
    entity.setRowsTotal(doc.rowsTotal);
    entity.setRowsSuccess(doc.rowsSuccess);
    entity.setRowsErrors(doc.rowsErrors);
    entity.setErrors(doc.errors);
    entity.setProfessionalId(doc.professionalId.toString());
    return entity;
  }
}
