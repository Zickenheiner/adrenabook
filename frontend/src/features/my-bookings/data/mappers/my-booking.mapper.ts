import type {
  BookingStatus,
  MyBookingEntity,
} from '../../domain/entities/my-booking.entity';
import type { MyBookingResponseDto } from '../dtos/my-booking.dto';

class MyBookingMapper {
  toEntity(dto: MyBookingResponseDto): MyBookingEntity {
    return {
      bookingId: dto.bookingId,
      activityTitle: dto.activityTitle,
      activityId: dto.activityId,
      centerName: dto.centerName,
      centerAddress: dto.centerAddress,
      startAt: new Date(dto.slotStartAt),
      durationMinutes: dto.durationMinutes,
      participants: dto.participants,
      status: dto.status as BookingStatus,
      totalEur: dto.totalEur,
      paidAmountEur: dto.paidAmountEur,
      remainingAmountEur: dto.remainingAmountEur,
      waiverSigned: dto.waiverSigned,
      coverPhotoUrl: dto.coverPhotoUrl,
      reservationExpiresAt: dto.reservationExpiresAt
        ? new Date(dto.reservationExpiresAt)
        : undefined,
    };
  }
}

export default MyBookingMapper;
