import { SlotEntity } from '@features/slot/domains/entities/slot.entity';
import { SlotDocument } from '@features/slot/domains/schemas/slot.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SlotMapper {
  toEntity(doc: SlotDocument): SlotEntity {
    const entity = new SlotEntity(doc._id);
    entity.setActivityId(doc.activityId);
    entity.setStartAt(doc.startAt);
    entity.setDurationMinutes(doc.durationMinutes);
    entity.setMaxParticipants(doc.maxParticipants);
    entity.setPriceEur(doc.priceEur);
    entity.setInstructorIds(doc.instructorIds);
    if (doc.recurrence) {
      entity.setRecurrence({
        rrule: doc.recurrence.rrule,
        untilDate: doc.recurrence.untilDate,
      });
    }
    return entity;
  }
}
