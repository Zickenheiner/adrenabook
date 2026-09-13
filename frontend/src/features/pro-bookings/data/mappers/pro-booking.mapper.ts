import type {
  ProBookingEntity,
  ProBookingStatus,
} from '../../domain/entities/pro-booking.entity';
import type { ProBookingResponseDto } from '../dtos/pro-booking.dto';

class ProBookingMapper {
  toEntity(dto: ProBookingResponseDto): ProBookingEntity {
    return {
      bookingId: dto.bookingId,
      activityTitle: dto.activityTitle,
      startAt: new Date(dto.slotStartAt),
      durationMinutes: dto.durationMinutes,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      participantNames: dto.participantNames ?? [],
      participants: dto.participants,
      status: dto.status as ProBookingStatus,
      totalEur: dto.totalEur,
      paidAmountEur: dto.paidAmountEur,
      bookedAt: new Date(dto.bookedAt),
    };
  }
}

export default ProBookingMapper;
