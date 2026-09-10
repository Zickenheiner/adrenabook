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
    if (doc.cancellationReason) {
      entity.setCancellationReason(doc.cancellationReason);
    }
    if (doc.cancellationComment) {
      entity.setCancellationComment(doc.cancellationComment);
    }
    if (doc.cancelledAt) {
      entity.setCancelledAt(doc.cancelledAt);
    }
    if (doc.refundedAmountEur !== undefined) {
      entity.setRefundedAmountEur(doc.refundedAmountEur);
    }
    if (doc.refundPolicy) {
      entity.setRefundPolicy(doc.refundPolicy);
    }
    if (doc.stripeRefundId) {
      entity.setStripeRefundId(doc.stripeRefundId);
    }
    return entity;
  }
}
