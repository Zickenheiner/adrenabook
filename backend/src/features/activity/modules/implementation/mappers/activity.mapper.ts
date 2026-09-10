import { ActivityEntity } from '@features/activity/domains/entities/activity.entity';
import { ActivityDocument } from '@features/activity/domains/schemas/activity.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ActivityMapper {
  toEntity(doc: ActivityDocument): ActivityEntity {
    const entity = new ActivityEntity(doc._id);
    entity.setTitle(doc.title);
    entity.setDescription(doc.description);
    entity.setType(doc.type);
    entity.setDifficulty(doc.difficulty);
    entity.setDurationMinutes(doc.durationMinutes);
    entity.setPriceFromEur(doc.priceFromEur);
    entity.setPrerequisites(doc.prerequisites);
    entity.setIncludedEquipment(doc.includedEquipment);
    entity.setPhotoFileIds(doc.photoFileIds);
    entity.setStatus(doc.status);
    entity.setCenterId(doc.centerId);
    if ((doc as any).createdAt) {
      entity.setCreatedAt((doc as any).createdAt as Date);
    }
    return entity;
  }
}
