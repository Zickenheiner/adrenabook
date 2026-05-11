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
    if (doc.stripePaymentIntentId) {
      entity.setStripePaymentIntentId(doc.stripePaymentIntentId);
    }
    if (doc.paidAmountEur !== undefined) {
      entity.setPaidAmountEur(doc.paidAmountEur);
    }
    if (doc.remainingAmountEur !== undefined) {
      entity.setRemainingAmountEur(doc.remainingAmountEur);
    }
    if (doc.finalPaymentDueAt) {
      entity.setFinalPaymentDueAt(doc.finalPaymentDueAt);
    }
    return entity;
  }
}
