import type {
  BookingSummaryEntity,
  ActivitySummaryEntity,
  DashboardEntity,
} from '../../domain/entities/dashboard.entity';
import type {
  BookingSummaryDto,
  ActivitySummaryDto,
  DashboardResponseDto,
} from '../dtos/dashboard.dto';

class DashboardMapper {
  private toBookingEntity(dto: BookingSummaryDto): BookingSummaryEntity {
    return {
      bookingId: dto.bookingId,
      activityTitle: dto.activityTitle,
      centerName: dto.centerName,
      date: new Date(dto.date),
      status: dto.status,
      coverPhotoUrl: dto.coverPhotoUrl,
    };
  }

  private toActivityEntity(dto: ActivitySummaryDto): ActivitySummaryEntity {
    return {
      id: dto.id,
      title: dto.title,
      type: dto.type,
      priceFromEur: dto.priceFromEur,
      durationMinutes: dto.durationMinutes,
      difficulty: dto.difficulty,
      centerName: dto.centerName,
      coverPhotoUrl: dto.coverPhotoUrl,
      rating: dto.rating,
    };
  }

  toEntity(dto: DashboardResponseDto): DashboardEntity {
    return {
      firstName: dto.firstName,
      upcomingBookings: dto.upcomingBookings.map((b) =>
        this.toBookingEntity(b),
      ),
      suggestedActivities: dto.suggestedActivities.map((a) =>
        this.toActivityEntity(a),
      ),
    };
  }
}

export default DashboardMapper;
