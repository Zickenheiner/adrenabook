import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ProDashboardRepository } from './pro-dashboard.repository';
import { Activity } from '@features/activity/domains/schemas/activity.schema';
import { Slot } from '@features/slot/domains/schemas/slot.schema';
import { Booking } from '@features/booking/domains/schemas/booking.schema';
import {
  DashboardQueryDto,
  DashboardRange,
} from '@features/professional/domains/dtos/pro-dashboard.dto';

/**
 * Query Mongoose chainable : select/lean renvoient la meme instance,
 * exec() resout la valeur finale.
 */
interface ChainableQuery {
  select: jest.Mock;
  lean: jest.Mock;
  exec: jest.Mock;
}

const mockQuery = (result: unknown): ChainableQuery => {
  const query = {} as ChainableQuery;
  query.select = jest.fn(() => query);
  query.lean = jest.fn(() => query);
  query.exec = jest.fn().mockResolvedValue(result);
  return query;
};

const EMPTY_DASHBOARD = {
  revenue: { totalEur: 0, vsPreviousPeriod: 0, series: [] },
  bookings: { confirmed: 0, cancelled: 0, cancellationRate: 0 },
  occupancyRate: 0,
  averageBasketEur: 0,
  topActivities: [],
};

describe('ProDashboardRepository', () => {
  let repository: ProDashboardRepository;
  let activityModel: { find: jest.Mock };
  let slotModel: { find: jest.Mock };
  let bookingModel: { find: jest.Mock };

  const centerId = new Types.ObjectId();
  const activityAId = new Types.ObjectId();
  const activityBId = new Types.ObjectId();
  const slotAId = new Types.ObjectId();
  const slotBId = new Types.ObjectId();

  // Une date fixe rend deterministes les fenetres temporelles calculees
  // par resolveDateRange.
  const NOW = new Date('2026-08-20T12:00:00.000Z');

  const monthQuery = { range: 'month' } as DashboardQueryDto;

  beforeEach(async () => {
    jest.useFakeTimers({ now: NOW, doNotFake: ['nextTick'] });

    activityModel = { find: jest.fn() };
    slotModel = { find: jest.fn() };
    bookingModel = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProDashboardRepository,
        { provide: getModelToken(Activity.name), useValue: activityModel },
        { provide: getModelToken(Slot.name), useValue: slotModel },
        { provide: getModelToken(Booking.name), useValue: bookingModel },
      ],
    }).compile();

    repository = module.get<ProDashboardRepository>(ProDashboardRepository);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getDashboard() — early exits', () => {
    it('should return an empty dashboard when the center has no activity', async () => {
      activityModel.find.mockReturnValue(mockQuery([]));

      const result = await repository.getDashboard(
        centerId.toString(),
        monthQuery,
      );

      expect(result).toEqual(EMPTY_DASHBOARD);
      expect(slotModel.find).not.toHaveBeenCalled();
    });

    it('should return an empty dashboard when no slot exists', async () => {
      activityModel.find.mockReturnValue(
        mockQuery([{ _id: activityAId, title: 'Escalade' }]),
      );
      slotModel.find.mockReturnValue(mockQuery([]));

      const result = await repository.getDashboard(
        centerId.toString(),
        monthQuery,
      );

      expect(result).toEqual(EMPTY_DASHBOARD);
      expect(bookingModel.find).not.toHaveBeenCalled();
    });

    it('should filter activities on the center ObjectId', async () => {
      activityModel.find.mockReturnValue(mockQuery([]));

      await repository.getDashboard(centerId.toString(), monthQuery);

      expect(activityModel.find).toHaveBeenCalledWith({
        centerId: expect.any(Types.ObjectId),
      });
    });

    it('should query the slots of the center activities', async () => {
      activityModel.find.mockReturnValue(
        mockQuery([{ _id: activityAId, title: 'Escalade' }]),
      );
      slotModel.find.mockReturnValue(mockQuery([]));

      await repository.getDashboard(centerId.toString(), monthQuery);

      expect(slotModel.find).toHaveBeenCalledWith({
        activityId: { $in: [activityAId] },
      });
    });

    it('should only fetch confirmed and cancelled bookings', async () => {
      activityModel.find.mockReturnValue(
        mockQuery([{ _id: activityAId, title: 'Escalade' }]),
      );
      slotModel.find.mockReturnValue(
        mockQuery([
          {
            _id: slotAId,
            activityId: activityAId,
            startAt: new Date('2026-08-10T09:00:00.000Z'),
            maxParticipants: 10,
          },
        ]),
      );
      bookingModel.find.mockReturnValue(mockQuery([]));

      await repository.getDashboard(centerId.toString(), monthQuery);

      expect(bookingModel.find).toHaveBeenCalledWith({
        slotId: { $in: [slotAId] },
        status: { $in: ['confirmed', 'cancelled'] },
      });
    });
  });

  describe('getDashboard() — aggregates', () => {
    // Aout 2026 (periode courante pour range=month), juillet 2026 pour la
    // periode precedente.
    const slots = [
      {
        _id: slotAId,
        activityId: activityAId,
        startAt: new Date('2026-08-10T09:00:00.000Z'),
        maxParticipants: 10,
      },
      {
        _id: slotBId,
        activityId: activityBId,
        startAt: new Date('2026-07-10T09:00:00.000Z'),
        maxParticipants: 5,
      },
    ];

    const stubModels = (bookings: unknown[]) => {
      activityModel.find.mockReturnValue(
        mockQuery([
          { _id: activityAId, title: 'Escalade' },
          { _id: activityBId, title: 'Canyoning' },
        ]),
      );
      slotModel.find.mockReturnValue(mockQuery(slots));
      bookingModel.find.mockReturnValue(mockQuery(bookings));
    };

    it('should return zeroed stats when no booking exists', async () => {
      stubModels([]);

      const result = await repository.getDashboard(
        centerId.toString(),
        monthQuery,
      );

      expect(result.revenue).toEqual({
        totalEur: 0,
        vsPreviousPeriod: 0,
        series: [],
      });
      expect(result.bookings).toEqual({
        confirmed: 0,
        cancelled: 0,
        cancellationRate: 0,
      });
      expect(result.averageBasketEur).toBe(0);
      expect(result.occupancyRate).toBe(0);
      expect(result.topActivities).toEqual([]);
    });

    it('should sum the revenue of the confirmed bookings of the period', async () => {
      stubModels([
        { _id: 'b1', slotId: slotAId, status: 'confirmed', totalEur: 120 },
        { _id: 'b2', slotId: slotAId, status: 'confirmed', totalEur: 80 },
      ]);

      const result = await repository.getDashboard(
        centerId.toString(),
        monthQuery,
      );

      expect(result.revenue.totalEur).toBe(200);
      expect(result.bookings.confirmed).toBe(2);
      expect(result.averageBasketEur).toBe(100);
    });

    it('should ignore cancelled bookings in the revenue but count them', async () => {
      stubModels([
        { _id: 'b1', slotId: slotAId, status: 'confirmed', totalEur: 120 },
        { _id: 'b2', slotId: slotAId, status: 'cancelled', totalEur: 120 },
      ]);

      const result = await repository.getDashboard(
        centerId.toString(),
        monthQuery,
      );

      expect(result.revenue.totalEur).toBe(120);
      expect(result.bookings).toEqual({
        confirmed: 1,
        cancelled: 1,
        cancellationRate: 50,
      });
    });

    it('should return a 0 % variation when the previous period had no revenue', async () => {
      stubModels([
        { _id: 'b1', slotId: slotAId, status: 'confirmed', totalEur: 120 },
      ]);

      const result = await repository.getDashboard(
        centerId.toString(),
        monthQuery,
      );

      expect(result.revenue.vsPreviousPeriod).toBe(0);
    });

    it('should compute the variation against the previous period', async () => {
      stubModels([
        // slotA est dans la periode courante, slotB dans la precedente
        { _id: 'b1', slotId: slotAId, status: 'confirmed', totalEur: 150 },
        { _id: 'b2', slotId: slotBId, status: 'confirmed', totalEur: 100 },
      ]);

      const result = await repository.getDashboard(
        centerId.toString(),
        monthQuery,
      );

      expect(result.revenue.totalEur).toBe(150);
      expect(result.revenue.vsPreviousPeriod).toBe(50);
    });

    it('should compute the occupancy rate over the capacity of the period slots', async () => {
      stubModels([
        { _id: 'b1', slotId: slotAId, status: 'confirmed', totalEur: 120 },
        { _id: 'b2', slotId: slotAId, status: 'confirmed', totalEur: 120 },
      ]);

      const result = await repository.getDashboard(
        centerId.toString(),
        monthQuery,
      );

      // 2 confirmees sur une capacite de 10 (seul slotA est dans la periode)
      expect(result.occupancyRate).toBe(20);
    });

    it('should return the top activities sorted by bookings count and capped at 3', async () => {
      const activityCId = new Types.ObjectId();
      const activityDId = new Types.ObjectId();
      const slotCId = new Types.ObjectId();
      const slotDId = new Types.ObjectId();

      activityModel.find.mockReturnValue(
        mockQuery([
          { _id: activityAId, title: 'Escalade' },
          { _id: activityBId, title: 'Canyoning' },
          { _id: activityCId, title: 'Plongee' },
          { _id: activityDId, title: 'Parapente' },
        ]),
      );
      slotModel.find.mockReturnValue(
        mockQuery([
          {
            _id: slotAId,
            activityId: activityAId,
            startAt: new Date('2026-08-10T09:00:00.000Z'),
            maxParticipants: 10,
          },
          {
            _id: slotBId,
            activityId: activityBId,
            startAt: new Date('2026-08-11T09:00:00.000Z'),
            maxParticipants: 10,
          },
          {
            _id: slotCId,
            activityId: activityCId,
            startAt: new Date('2026-08-12T09:00:00.000Z'),
            maxParticipants: 10,
          },
          {
            _id: slotDId,
            activityId: activityDId,
            startAt: new Date('2026-08-13T09:00:00.000Z'),
            maxParticipants: 10,
          },
        ]),
      );
      bookingModel.find.mockReturnValue(
        mockQuery([
          { _id: 'b1', slotId: slotAId, status: 'confirmed', totalEur: 10 },
          { _id: 'b2', slotId: slotAId, status: 'confirmed', totalEur: 10 },
          { _id: 'b3', slotId: slotAId, status: 'confirmed', totalEur: 10 },
          { _id: 'b4', slotId: slotBId, status: 'confirmed', totalEur: 20 },
          { _id: 'b5', slotId: slotBId, status: 'confirmed', totalEur: 20 },
          { _id: 'b6', slotId: slotCId, status: 'confirmed', totalEur: 30 },
          { _id: 'b7', slotId: slotDId, status: 'confirmed', totalEur: 40 },
        ]),
      );

      const result = await repository.getDashboard(
        centerId.toString(),
        monthQuery,
      );

      expect(result.topActivities).toHaveLength(3);
      expect(result.topActivities[0]).toEqual({
        activityId: activityAId.toString(),
        title: 'Escalade',
        bookingsCount: 3,
        revenueEur: 30,
      });
      expect(result.topActivities[1]).toEqual({
        activityId: activityBId.toString(),
        title: 'Canyoning',
        bookingsCount: 2,
        revenueEur: 40,
      });
    });

    it('should fall back on epoch and default capacity for an unknown slot', async () => {
      const orphanSlotId = new Types.ObjectId();
      stubModels([
        {
          _id: 'b1',
          slotId: orphanSlotId,
          status: 'confirmed',
          totalEur: 120,
        },
      ]);

      const result = await repository.getDashboard(
        centerId.toString(),
        monthQuery,
      );

      // slotStartAt tombe sur l'epoch, donc hors de la periode courante
      expect(result.bookings.confirmed).toBe(0);
      expect(result.revenue.totalEur).toBe(0);
    });

    it('should expose an empty title for an activity outside the center map', async () => {
      activityModel.find.mockReturnValue(mockQuery([{ _id: activityAId }]));
      slotModel.find.mockReturnValue(
        mockQuery([
          {
            _id: slotAId,
            activityId: activityBId,
            startAt: new Date('2026-08-10T09:00:00.000Z'),
            maxParticipants: 10,
          },
        ]),
      );
      bookingModel.find.mockReturnValue(
        mockQuery([
          { _id: 'b1', slotId: slotAId, status: 'confirmed', totalEur: 120 },
        ]),
      );

      const result = await repository.getDashboard(
        centerId.toString(),
        monthQuery,
      );

      expect(result.topActivities[0].title).toBe('');
    });
  });

  describe('getDashboard() — date ranges', () => {
    const stubForRange = (bookingStartAt: Date) => {
      activityModel.find.mockReturnValue(
        mockQuery([{ _id: activityAId, title: 'Escalade' }]),
      );
      slotModel.find.mockReturnValue(
        mockQuery([
          {
            _id: slotAId,
            activityId: activityAId,
            startAt: bookingStartAt,
            maxParticipants: 10,
          },
        ]),
      );
      bookingModel.find.mockReturnValue(
        mockQuery([
          { _id: 'b1', slotId: slotAId, status: 'confirmed', totalEur: 100 },
        ]),
      );
    };

    it.each<DashboardRange>(['day', 'week', 'month', 'quarter', 'year'])(
      'should accept the %s range',
      async (range) => {
        stubForRange(new Date('2026-08-20T10:00:00.000Z'));

        const result = await repository.getDashboard(centerId.toString(), {
          range,
        } as DashboardQueryDto);

        expect(result.revenue.totalEur).toBe(100);
      },
    );

    it('should use an explicit from/to window over the range', async () => {
      stubForRange(new Date('2026-03-15T10:00:00.000Z'));

      const result = await repository.getDashboard(centerId.toString(), {
        range: 'month',
        from: '2026-03-01T00:00:00.000Z',
        to: '2026-03-31T23:59:59.000Z',
      } as DashboardQueryDto);

      expect(result.revenue.totalEur).toBe(100);
    });

    it('should exclude a booking outside the explicit from/to window', async () => {
      stubForRange(new Date('2026-05-15T10:00:00.000Z'));

      const result = await repository.getDashboard(centerId.toString(), {
        range: 'month',
        from: '2026-03-01T00:00:00.000Z',
        to: '2026-03-31T23:59:59.000Z',
      } as DashboardQueryDto);

      expect(result.revenue.totalEur).toBe(0);
    });
  });

  describe('getDashboard() — revenue series grouping', () => {
    const buildSlots = (dates: Date[]) =>
      dates.map((startAt, index) => ({
        _id: new Types.ObjectId(),
        activityId: activityAId,
        startAt,
        maxParticipants: 10,
        index,
      }));

    const stubSeries = (dates: Date[], amounts: number[]) => {
      const slots = buildSlots(dates);
      activityModel.find.mockReturnValue(
        mockQuery([{ _id: activityAId, title: 'Escalade' }]),
      );
      slotModel.find.mockReturnValue(mockQuery(slots));
      bookingModel.find.mockReturnValue(
        mockQuery(
          slots.map((slot, index) => ({
            _id: `b${index}`,
            slotId: slot._id,
            status: 'confirmed',
            totalEur: amounts[index],
          })),
        ),
      );
    };

    it('should group the series by hour for the day range', async () => {
      stubSeries(
        [
          new Date('2026-08-20T08:30:00.000Z'),
          new Date('2026-08-20T08:45:00.000Z'),
        ],
        [50, 30],
      );

      const result = await repository.getDashboard(centerId.toString(), {
        range: 'day',
      } as DashboardQueryDto);

      expect(result.revenue.series).toHaveLength(1);
      expect(result.revenue.series[0].valueEur).toBe(80);
      expect(result.revenue.series[0].date).toMatch(/^2026-08-20 \d{2}:00$/);
    });

    it('should group the series by day for the month range', async () => {
      stubSeries(
        [
          new Date('2026-08-10T09:00:00.000Z'),
          new Date('2026-08-11T09:00:00.000Z'),
        ],
        [50, 30],
      );

      const result = await repository.getDashboard(
        centerId.toString(),
        monthQuery,
      );

      expect(result.revenue.series).toHaveLength(2);
      expect(result.revenue.series.map((item) => item.valueEur)).toEqual([
        50, 30,
      ]);
      expect(result.revenue.series[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should group the series by month for the year range', async () => {
      stubSeries(
        [
          new Date('2026-06-10T09:00:00.000Z'),
          new Date('2026-06-20T09:00:00.000Z'),
          new Date('2026-07-01T09:00:00.000Z'),
        ],
        [50, 30, 20],
      );

      const result = await repository.getDashboard(centerId.toString(), {
        range: 'year',
      } as DashboardQueryDto);

      expect(result.revenue.series).toEqual([
        { date: '2026-06', valueEur: 80 },
        { date: '2026-07', valueEur: 20 },
      ]);
    });

    it('should sort the series chronologically', async () => {
      stubSeries(
        [
          new Date('2026-08-15T09:00:00.000Z'),
          new Date('2026-08-02T09:00:00.000Z'),
        ],
        [50, 30],
      );

      const result = await repository.getDashboard(
        centerId.toString(),
        monthQuery,
      );

      const dates = result.revenue.series.map((item) => item.date);
      expect([...dates].sort()).toEqual(dates);
    });
  });
});
