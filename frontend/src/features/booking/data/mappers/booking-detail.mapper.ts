import type {
  BookingDetailEntity,
  BookingDetailParticipant,
} from '../../domain/entities/booking-detail.entity';
import type {
  BookingDetailParticipantDto,
  BookingDetailResponseDto,
} from '../dtos/booking-detail.dto';

class BookingDetailMapper {
  toParticipantEntity(
    dto: BookingDetailParticipantDto,
  ): BookingDetailParticipant {
    return {
      firstName: dto.firstName,
      lastName: dto.lastName,
    };
  }

  toEntity(dto: BookingDetailResponseDto): BookingDetailEntity {
    return {
      bookingId: dto.bookingId,
      status: dto.status,
      reservationExpiresAt: dto.reservationExpiresAt
        ? new Date(dto.reservationExpiresAt)
        : null,
      totalEur: dto.totalEur,
      vatEur: dto.vatEur,
      participants: (dto.participants ?? []).map((p) =>
        this.toParticipantEntity(p),
      ),
      activityTitle: dto.activityTitle,
      slotStartAt: new Date(dto.slotStartAt),
      waiverSigned: dto.waiverSigned,
    };
  }
}

export default BookingDetailMapper;
