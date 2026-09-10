import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IProDashboardRepository } from '@features/professional/interfaces/repositories/pro-dashboard.irepository';
import {
  DashboardQueryDto,
  DashboardRange,
  DashboardResponseDto,
  RevenueSeriesItemDto,
  TopActivityDto,
} from '@features/professional/domains/dtos/pro-dashboard.dto';
import {
  Activity,
  ActivityDocument,
} from '@features/activity/domains/schemas/activity.schema';
import { Slot, SlotDocument } from '@features/slot/domains/schemas/slot.schema';
import {
  Booking,
  BookingDocument,
} from '@features/booking/domains/schemas/booking.schema';

interface DateRange {
  from: Date;
  to: Date;
}

@Injectable()
export class ProDashboardRepository implements IProDashboardRepository {
  constructor(
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
    @InjectModel(Slot.name)
    private readonly slotModel: Model<SlotDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  private resolveDateRange(query: DashboardQueryDto): {
    current: DateRange;
    previous: DateRange;
  } {
    const now = new Date();

    if (query.from && query.to) {
      const from = new Date(query.from);
      const to = new Date(query.to);
      const durationMs = to.getTime() - from.getTime();
      return {
        current: { from, to },
        previous: {
          from: new Date(from.getTime() - durationMs),
          to: new Date(from.getTime()),
        },
      };
    }

    const range: DashboardRange = query.range;
    let from: Date;
    let previous: DateRange;

    switch (range) {
      case 'day':
        from = new Date(now);
        from.setHours(0, 0, 0, 0);
        previous = {
          from: new Date(from.getTime() - 86400000),
          to: new Date(from),
        };
        break;
      case 'week':
        from = new Date(now);
        from.setDate(from.getDate() - from.getDay());
        from.setHours(0, 0, 0, 0);
        previous = {
          from: new Date(from.getTime() - 7 * 86400000),
          to: new Date(from),
        };
        break;
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        previous = {
          from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          to: new Date(from),
        };
        break;
      case 'quarter': {
        const q = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), q * 3, 1);
        previous = {
          from: new Date(now.getFullYear(), q * 3 - 3, 1),
          to: new Date(from),
        };
        break;
      }
      case 'year':
        from = new Date(now.getFullYear(), 0, 1);
        previous = {
          from: new Date(now.getFullYear() - 1, 0, 1),
          to: new Date(from),
        };
        break;
    }

    return {
      current: { from, to: now },
      previous,
    };
  }

  private groupSeriesByRange(
    range: DashboardRange,
    bookings: Array<{ slotStartAt: Date; totalEur: number }>,
    _from: Date,
    _to: Date,
  ): RevenueSeriesItemDto[] {
    const map = new Map<string, number>();

    for (const b of bookings) {
      const d = new Date(b.slotStartAt);
      let key: string;
      if (range === 'day') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:00`;
      } else if (range === 'week' || range === 'month') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }
      map.set(key, (map.get(key) ?? 0) + b.totalEur);
    }

    return Array.from(map.entries())
      .map(([date, valueEur]) => ({ date, valueEur }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getDashboard(
    centerId: string,
    query: DashboardQueryDto,
  ): Promise<DashboardResponseDto> {
    const { current, previous } = this.resolveDateRange(query);

    // 1. Find all activity IDs for this center
    const activities = await this.activityModel
      .find({ centerId: new Types.ObjectId(centerId) })
      .select('_id title')
      .lean()
      .exec();

    const activityIds = activities.map((a) => a._id);
    const activityMap = new Map<string, string>(
      activities.map((a) => [a._id.toString(), a.title as string]),
    );

    if (activityIds.length === 0) {
      return this.emptyDashboard();
    }

    // 2. Find all slots for those activities
    const slots = await this.slotModel
      .find({ activityId: { $in: activityIds } })
      .select('_id activityId startAt maxParticipants')
      .lean()
      .exec();

    const slotIds = slots.map((s) => s._id);
    const slotMap = new Map(
      slots.map((s) => [
        s._id.toString(),
        {
          activityId: s.activityId.toString(),
          startAt: s.startAt as Date,
          maxParticipants: s.maxParticipants as number,
        },
      ]),
    );

    if (slotIds.length === 0) {
      return this.emptyDashboard();
    }

    // 3. Fetch bookings for current and previous periods
    const allBookings = await this.bookingModel
      .find({
        slotId: { $in: slotIds },
        status: { $in: ['confirmed', 'cancelled'] },
      })
      .select('_id slotId status totalEur cancelledAt createdAt')
      .lean()
      .exec();

    // Map bookings with slot metadata
    const enriched = allBookings.map((b) => {
      const slot = slotMap.get(b.slotId.toString());
      return {
        ...b,
        slotStartAt: slot?.startAt ?? new Date(0),
        maxParticipants: slot?.maxParticipants ?? 1,
        activityId: slot?.activityId ?? '',
      };
    });

    const inRange = (date: Date, range: DateRange) =>
      date >= range.from && date <= range.to;

    const currentBookings = enriched.filter((b) =>
      inRange(b.slotStartAt, current),
    );
    const previousBookings = enriched.filter((b) =>
      inRange(b.slotStartAt, previous),
    );

    // 4. Compute current period stats
    const confirmedCurrent = currentBookings.filter(
      (b) => b.status === 'confirmed',
    );
    const cancelledCurrent = currentBookings.filter(
      (b) => b.status === 'cancelled',
    );

    const totalRevenueCurrent = confirmedCurrent.reduce(
      (sum, b) => sum + (b.totalEur as number),
      0,
    );
    const totalRevenuePrevious = previousBookings
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.totalEur as number), 0);

    const vsPreviousPeriod =
      totalRevenuePrevious === 0
        ? 0
        : Math.round(
            ((totalRevenueCurrent - totalRevenuePrevious) /
              totalRevenuePrevious) *
              10000,
          ) / 100;

    const series = this.groupSeriesByRange(
      query.range,
      confirmedCurrent.map((b) => ({
        slotStartAt: b.slotStartAt,
        totalEur: b.totalEur as number,
      })),
      current.from,
      current.to,
    );

    const totalConfirmed = confirmedCurrent.length;
    const totalCancelled = cancelledCurrent.length;
    const totalBookings = totalConfirmed + totalCancelled;
    const cancellationRate =
      totalBookings === 0
        ? 0
        : Math.round((totalCancelled / totalBookings) * 10000) / 100;

    const averageBasketEur =
      totalConfirmed === 0
        ? 0
        : Math.round((totalRevenueCurrent / totalConfirmed) * 100) / 100;

    // 5. Occupancy rate — confirmed / totalSlotCapacity in range
    const currentSlots = slots.filter((s) =>
      inRange(s.startAt as Date, current),
    );
    const totalCapacity = currentSlots.reduce(
      (sum, s) => sum + (s.maxParticipants as number),
      0,
    );
    const occupancyRate =
      totalCapacity === 0
        ? 0
        : Math.round((totalConfirmed / totalCapacity) * 10000) / 100;

    // 6. Top activities (top 3 by bookings count)
    const activityStats = new Map<
      string,
      { bookingsCount: number; revenueEur: number }
    >();
    for (const b of confirmedCurrent) {
      const existing = activityStats.get(b.activityId) ?? {
        bookingsCount: 0,
        revenueEur: 0,
      };
      existing.bookingsCount++;
      existing.revenueEur += b.totalEur as number;
      activityStats.set(b.activityId, existing);
    }

    const topActivities: TopActivityDto[] = Array.from(activityStats.entries())
      .map(([activityId, stats]) => ({
        activityId,
        title: activityMap.get(activityId) ?? '',
        bookingsCount: stats.bookingsCount,
        revenueEur: Math.round(stats.revenueEur * 100) / 100,
      }))
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 3);

    return {
      revenue: {
        totalEur: Math.round(totalRevenueCurrent * 100) / 100,
        vsPreviousPeriod,
        series,
      },
      bookings: {
        confirmed: totalConfirmed,
        cancelled: totalCancelled,
        cancellationRate,
      },
      occupancyRate,
      averageBasketEur,
      topActivities,
    };
  }

  private emptyDashboard(): DashboardResponseDto {
    return {
      revenue: { totalEur: 0, vsPreviousPeriod: 0, series: [] },
      bookings: { confirmed: 0, cancelled: 0, cancellationRate: 0 },
      occupancyRate: 0,
      averageBasketEur: 0,
      topActivities: [],
    };
  }
}
