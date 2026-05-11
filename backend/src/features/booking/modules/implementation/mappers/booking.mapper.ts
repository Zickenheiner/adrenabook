import { BookingEntity } from '@features/booking/domains/entities/booking.entity';
import { BookingDocument } from '@features/booking/domains/schemas/booking.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BookingMapper {
  toEntity(doc: BookingDocument): BookingEntity {
    const entity = new BookingEntity(doc._id);
    entity.setSlotId(doc.slotId);
    entity.setUserId(doc.userId);
    entity.setParticipants(doc.participants);
    entity.setAcceptCenterTerms(doc.acceptCenterTerms);
    entity.setStatus(doc.status);
    entity.setReservationExpiresAt(doc.reservationExpiresAt);
    entity.setTotalEur(doc.totalEur);
    entity.setVatEur(doc.vatEur);
    entity.setPaymentIntentClientSecret(doc.paymentIntentClientSecret);
    return entity;
  }
}
