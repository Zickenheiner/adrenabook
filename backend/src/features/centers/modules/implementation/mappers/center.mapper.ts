import { CenterEntity } from '@features/centers/domains/entities/center.entity';
import { CenterDocument } from '@features/centers/domains/schemas/center.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CenterMapper {
  toEntity(doc: CenterDocument): CenterEntity {
    const entity = new CenterEntity(doc._id);
    entity.setName(doc.name);
    entity.setLat(doc.lat);
    entity.setLng(doc.lng);
    entity.setCity(doc.city);
    entity.setActivityTypes(doc.activityTypes);
    entity.setActivitiesCount(doc.activitiesCount);
    return entity;
  }
}
