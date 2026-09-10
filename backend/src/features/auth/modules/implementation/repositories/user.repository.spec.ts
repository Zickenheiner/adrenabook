import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PipelineStage, Types } from 'mongoose';
import { UserRepository } from './user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { User } from '@features/auth/domains/schemas/user.schema';
import { Booking } from '@features/booking/domains/schemas/booking.schema';
import { Activity } from '@features/activity/domains/schemas/activity.schema';
import { Invoice } from '@features/invoice/domains/schemas/invoice.schema';
import {
  CreateUserDto,
  HealthProfileDto,
  NotificationPreferencesDto,
  RegisterDto,
} from '@features/auth/domains/dtos/user.dto';

/**
 * Query Mongoose chainable : sort/select/lean renvoient la meme instance,
 * exec() resout la valeur finale.
 */
interface ChainableQuery {
  sort: jest.Mock;
  select: jest.Mock;
  lean: jest.Mock;
  exec: jest.Mock;
}

const mockQuery = (result: unknown): ChainableQuery => {
  const query = {} as ChainableQuery;
  query.sort = jest.fn(() => query);
  query.select = jest.fn(() => query);
  query.lean = jest.fn(() => query);
  query.exec = jest.fn().mockResolvedValue(result);
  return query;
};

/**
 * Aggregate Mongoose : directement awaitable et egalement terminable
 * par exec(), les deux formes etant utilisees par le repository.
 */
const mockAggregate = <T>(result: T[]) =>
  Object.assign(Promise.resolve(result), {
    exec: jest.fn().mockResolvedValue(result),
  });

interface UserModelMock extends jest.Mock {
  find: jest.Mock;
  findOne: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
}

describe('UserRepository', () => {
  let repository: UserRepository;
  let userModel: UserModelMock;
  let bookingModel: { find: jest.Mock; aggregate: jest.Mock };
  let activityModel: { aggregate: jest.Mock };
  let invoiceModel: { find: jest.Mock };
  let userMapper: { toEntity: jest.Mock };
  let saveMock: jest.Mock;

  const userId = new Types.ObjectId();

  beforeEach(async () => {
    saveMock = jest.fn();

    userModel = jest.fn().mockImplementation((data: unknown) => ({
      ...(data as Record<string, unknown>),
      save: saveMock,
    })) as unknown as UserModelMock;

    userModel.find = jest.fn();
    userModel.findOne = jest.fn();
    userModel.findById = jest.fn();
    userModel.findByIdAndUpdate = jest.fn();
    userModel.findByIdAndDelete = jest.fn();

    bookingModel = { find: jest.fn(), aggregate: jest.fn() };
    activityModel = { aggregate: jest.fn() };
    invoiceModel = { find: jest.fn() };

    userMapper = {
      toEntity: jest.fn((doc: { _id: unknown }) => ({
        entityFor: String(doc._id),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Booking.name), useValue: bookingModel },
        { provide: getModelToken(Activity.name), useValue: activityModel },
        { provide: getModelToken(Invoice.name), useValue: invoiceModel },
        { provide: UserMapper, useValue: userMapper },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    it('should map every document to an entity', async () => {
      userModel.find.mockReturnValue(mockQuery([{ _id: 'u1' }, { _id: 'u2' }]));

      const result = await repository.findAll();

      expect(result).toEqual([{ entityFor: 'u1' }, { entityFor: 'u2' }]);
    });

    it('should return an empty array when no user exists', async () => {
      userModel.find.mockReturnValue(mockQuery([]));

      expect(await repository.findAll()).toEqual([]);
      expect(userMapper.toEntity).not.toHaveBeenCalled();
    });

    it('should return null when the query resolves to null', async () => {
      userModel.find.mockReturnValue(mockQuery(null));

      expect(await repository.findAll()).toBeNull();
    });
  });

  describe('findById()', () => {
    it('should map the found document', async () => {
      userModel.findById.mockReturnValue(mockQuery({ _id: 'u1' }));

      const result = await repository.findById('u1');

      expect(userModel.findById).toHaveBeenCalledWith('u1');
      expect(result).toEqual({ entityFor: 'u1' });
    });

    it('should return null when the user does not exist', async () => {
      userModel.findById.mockReturnValue(mockQuery(null));

      expect(await repository.findById('missing')).toBeNull();
    });
  });

  describe('findByEmail()', () => {
    it('should normalise the email before querying', async () => {
      userModel.findOne.mockReturnValue(mockQuery({ _id: 'u1' }));

      const result = await repository.findByEmail('  Remi@Example.COM  ');

      expect(userModel.findOne).toHaveBeenCalledWith({
        email: 'remi@example.com',
      });
      expect(result).toEqual({ entityFor: 'u1' });
    });

    it('should return null when no user matches the email', async () => {
      userModel.findOne.mockReturnValue(mockQuery(null));

      expect(await repository.findByEmail('nobody@example.com')).toBeNull();
    });
  });

  describe('register()', () => {
    const dto = {
      email: 'remi@example.com',
      firstName: 'Remi',
      lastName: 'Durand',
      birthDate: '1990-05-12',
      acceptCgu: true,
      acceptRgpd: true,
    } as unknown as RegisterDto;

    it('should build the document with the default security fields', async () => {
      saveMock.mockResolvedValue({ _id: 'created' });

      const result = await repository.register(dto, 'hashed', 'verif-token');

      expect(userModel).toHaveBeenCalledWith({
        email: 'remi@example.com',
        password: 'hashed',
        firstName: 'Remi',
        lastName: 'Durand',
        birthDate: new Date('1990-05-12'),
        acceptCgu: true,
        acceptRgpd: true,
        emailVerified: false,
        emailVerificationToken: 'verif-token',
        role: 'aventurier',
        failedLoginAttempts: 0,
        twoFactorEnabled: false,
      });
      expect(result).toEqual({ entityFor: 'created' });
    });

    it('should return null when the save returns nothing', async () => {
      saveMock.mockResolvedValue(null);

      expect(
        await repository.register(dto, 'hashed', 'verif-token'),
      ).toBeNull();
    });
  });

  describe('create()', () => {
    it('should return true when the document is saved', async () => {
      saveMock.mockResolvedValue({ _id: 'created' });

      const dto = { email: 'a@b.c' } as unknown as CreateUserDto;
      const result = await repository.create(dto);

      expect(userModel).toHaveBeenCalledWith(dto);
      expect(result).toBe(true);
    });

    it('should return false when the save returns nothing', async () => {
      saveMock.mockResolvedValue(null);

      expect(await repository.create({} as unknown as CreateUserDto)).toBe(
        false,
      );
    });
  });

  describe('update()', () => {
    it('should return true when the user was updated', async () => {
      userModel.findByIdAndUpdate.mockReturnValue(mockQuery({ _id: 'u1' }));

      const result = await repository.update('u1', { firstName: 'Remi' });

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'u1',
        { firstName: 'Remi' },
        { new: true },
      );
      expect(result).toBe(true);
    });

    it('should return false when no user matched', async () => {
      userModel.findByIdAndUpdate.mockReturnValue(mockQuery(null));

      expect(await repository.update('missing', {})).toBe(false);
    });
  });

  describe('delete()', () => {
    it('should return true when the user was deleted', async () => {
      userModel.findByIdAndDelete.mockReturnValue(mockQuery({ _id: 'u1' }));

      expect(await repository.delete('u1')).toBe(true);
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('u1');
    });

    it('should return false when no user matched', async () => {
      userModel.findByIdAndDelete.mockReturnValue(mockQuery(null));

      expect(await repository.delete('missing')).toBe(false);
    });
  });

  describe('incrementFailedAttempts()', () => {
    it('should increment the counter and map the updated document', async () => {
      userModel.findByIdAndUpdate.mockReturnValue(mockQuery({ _id: 'u1' }));

      const result = await repository.incrementFailedAttempts('u1');

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'u1',
        { $inc: { failedLoginAttempts: 1 } },
        { new: true },
      );
      expect(result).toEqual({ entityFor: 'u1' });
    });

    it('should return null when no user matched', async () => {
      userModel.findByIdAndUpdate.mockReturnValue(mockQuery(null));

      expect(await repository.incrementFailedAttempts('missing')).toBeNull();
    });
  });

  describe('boolean update methods', () => {
    const lockedUntil = new Date('2026-08-20T13:00:00.000Z');
    const expiresAt = new Date('2026-08-20T13:10:00.000Z');

    // Chaque entree decrit l'appel a tester et la charge attendue passee
    // a findByIdAndUpdate.
    const cases: Array<{
      name: string;
      call: () => Promise<boolean>;
      payload: Record<string, unknown>;
    }> = [
      {
        name: 'lockAccount',
        call: () => repository.lockAccount('u1', lockedUntil),
        payload: { lockedUntil },
      },
      {
        name: 'resetFailedAttempts',
        call: () => repository.resetFailedAttempts('u1'),
        payload: {
          failedLoginAttempts: 0,
          $unset: { lockedUntil: '' },
        },
      },
      {
        name: 'setTwoFactorCode',
        call: () => repository.setTwoFactorCode('u1', '123456', expiresAt),
        payload: {
          twoFactorCode: '123456',
          twoFactorCodeExpiresAt: expiresAt,
        },
      },
      {
        name: 'clearTwoFactorCode',
        call: () => repository.clearTwoFactorCode('u1'),
        payload: {
          $unset: { twoFactorCode: '', twoFactorCodeExpiresAt: '' },
        },
      },
      {
        name: 'setRefreshTokenHash',
        call: () => repository.setRefreshTokenHash('u1', 'rt-hash'),
        payload: { refreshTokenHash: 'rt-hash' },
      },
      {
        name: 'clearRefreshTokenHash',
        call: () => repository.clearRefreshTokenHash('u1'),
        payload: { $unset: { refreshTokenHash: '' } },
      },
      {
        name: 'setPasswordResetToken',
        call: () =>
          repository.setPasswordResetToken('u1', 'reset-hash', expiresAt),
        payload: {
          passwordResetTokenHash: 'reset-hash',
          passwordResetTokenExpiresAt: expiresAt,
        },
      },
      {
        name: 'clearPasswordResetToken',
        call: () => repository.clearPasswordResetToken('u1'),
        payload: {
          $unset: {
            passwordResetTokenHash: '',
            passwordResetTokenExpiresAt: '',
          },
        },
      },
      {
        name: 'updatePassword',
        call: () => repository.updatePassword('u1', 'new-hash'),
        payload: { password: 'new-hash' },
      },
      {
        name: 'updateStatus',
        call: () => repository.updateStatus('u1', 'suspended'),
        payload: { status: 'suspended' },
      },
      {
        name: 'updateNotificationPreferences',
        call: () =>
          repository.updateNotificationPreferences('u1', {
            email: {
              bookingConfirmation: true,
              reminders: false,
              marketing: false,
            },
            sms: { bookingConfirmation: true, reminders: false },
          } as unknown as NotificationPreferencesDto),
        payload: {
          notificationPreferences: {
            email: {
              bookingConfirmation: true,
              reminders: false,
              marketing: false,
            },
            sms: { bookingConfirmation: true, reminders: false },
          },
        },
      },
    ];

    it.each(cases)(
      '$name should send the expected payload and return true',
      async ({ call, payload }) => {
        userModel.findByIdAndUpdate.mockReturnValue(mockQuery({ _id: 'u1' }));

        const result = await call();

        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
          'u1',
          payload,
          { new: true },
        );
        expect(result).toBe(true);
      },
    );

    it.each(cases)(
      '$name should return false when no user matched',
      async ({ call }) => {
        userModel.findByIdAndUpdate.mockReturnValue(mockQuery(null));

        expect(await call()).toBe(false);
      },
    );
  });

  describe('setRgpdExportCompleted()', () => {
    it('should store a completed export request', async () => {
      userModel.findByIdAndUpdate.mockReturnValue(mockQuery({ _id: 'u1' }));
      const completedAt = new Date('2026-08-20T14:00:00.000Z');

      const result = await repository.setRgpdExportCompleted(
        'u1',
        'req-1',
        completedAt,
      );

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'u1',
        {
          rgpdRequest: {
            requestId: 'req-1',
            requestType: 'export',
            status: 'completed',
            requestedAt: expect.any(Date),
            completedAt,
          },
        },
        { new: true },
      );
      expect(result).toBe(true);
    });

    it('should return false when no user matched', async () => {
      userModel.findByIdAndUpdate.mockReturnValue(mockQuery(null));

      expect(
        await repository.setRgpdExportCompleted('missing', 'req-1', new Date()),
      ).toBe(false);
    });
  });

  describe('setRgpdDeleteRequest()', () => {
    const confirmationCodeExpiresAt = new Date('2026-08-20T15:00:00.000Z');
    const scheduledDeletionAt = new Date('2026-09-20T15:00:00.000Z');

    it('should store a scheduled delete request', async () => {
      userModel.findByIdAndUpdate.mockReturnValue(mockQuery({ _id: 'u1' }));

      const result = await repository.setRgpdDeleteRequest(
        'u1',
        'req-2',
        '654321',
        confirmationCodeExpiresAt,
        scheduledDeletionAt,
      );

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'u1',
        {
          rgpdRequest: {
            requestId: 'req-2',
            requestType: 'delete',
            status: 'scheduled',
            requestedAt: expect.any(Date),
            scheduledDeletionAt,
            confirmationCode: '654321',
            confirmationCodeExpiresAt,
          },
        },
        { new: true },
      );
      expect(result).toBe(true);
    });

    it('should return false when no user matched', async () => {
      userModel.findByIdAndUpdate.mockReturnValue(mockQuery(null));

      expect(
        await repository.setRgpdDeleteRequest(
          'missing',
          'req-2',
          '654321',
          confirmationCodeExpiresAt,
          scheduledDeletionAt,
        ),
      ).toBe(false);
    });
  });

  describe('getRgpdRequest()', () => {
    it('should delegate to findById', async () => {
      userModel.findById.mockReturnValue(mockQuery({ _id: 'u1' }));

      const result = await repository.getRgpdRequest('u1');

      expect(userModel.findById).toHaveBeenCalledWith('u1');
      expect(result).toEqual({ entityFor: 'u1' });
    });
  });

  describe('updateHealthProfile()', () => {
    const dto = {
      weight: 72,
      height: 180,
      emergencyContact: {
        fullName: 'Marie Durand',
        relation: 'soeur',
        phone: '+33600000000',
      },
      medicalCertificateFileId: 'file_123',
    } as unknown as HealthProfileDto;

    it('should store the encrypted contraindications', async () => {
      userModel.findByIdAndUpdate.mockReturnValue(mockQuery({ _id: 'u1' }));

      const result = await repository.updateHealthProfile('u1', dto, [
        'encrypted-1',
      ]);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'u1',
        {
          healthProfile: {
            weight: 72,
            height: 180,
            medicalContraindications: ['encrypted-1'],
            emergencyContact: dto.emergencyContact,
            medicalCertificateFileId: 'file_123',
          },
        },
        { new: true },
      );
      expect(result).toBe(true);
    });

    it('should accept undefined contraindications', async () => {
      userModel.findByIdAndUpdate.mockReturnValue(mockQuery({ _id: 'u1' }));

      await repository.updateHealthProfile('u1', dto, undefined);

      const payload = userModel.findByIdAndUpdate.mock.calls[0][1] as {
        healthProfile: { medicalContraindications?: string[] };
      };
      expect(payload.healthProfile.medicalContraindications).toBeUndefined();
    });

    it('should return false when no user matched', async () => {
      userModel.findByIdAndUpdate.mockReturnValue(mockQuery(null));

      expect(
        await repository.updateHealthProfile('missing', dto, undefined),
      ).toBe(false);
    });
  });

  describe('getRgpdExportData()', () => {
    it('should return empty collections for an invalid user id', async () => {
      const result = await repository.getRgpdExportData('not-an-object-id');

      expect(result).toEqual({ bookings: [], invoices: [] });
      expect(bookingModel.find).not.toHaveBeenCalled();
      expect(invoiceModel.find).not.toHaveBeenCalled();
    });

    it('should return empty collections when the user has no data', async () => {
      bookingModel.find.mockReturnValue(mockQuery([]));
      invoiceModel.find.mockReturnValue(mockQuery([]));

      const result = await repository.getRgpdExportData(userId.toString());

      expect(result).toEqual({ bookings: [], invoices: [] });
    });

    it('should query both collections with the user ObjectId', async () => {
      bookingModel.find.mockReturnValue(mockQuery([]));
      invoiceModel.find.mockReturnValue(mockQuery([]));

      await repository.getRgpdExportData(userId.toString());

      expect(bookingModel.find).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
      });
      expect(invoiceModel.find).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
      });
    });

    it('should map the bookings and the invoices', async () => {
      const bookingId = new Types.ObjectId();
      const invoiceId = new Types.ObjectId();
      const slotId = new Types.ObjectId();

      bookingModel.find.mockReturnValue(
        mockQuery([
          {
            _id: bookingId,
            slotId,
            status: 'confirmed',
            totalEur: 216,
            vatEur: 36,
            participants: [{ firstName: 'Remi' }, { firstName: 'Marie' }],
            createdAt: new Date('2026-07-01T10:00:00.000Z'),
          },
        ]),
      );
      invoiceModel.find.mockReturnValue(
        mockQuery([
          {
            _id: invoiceId,
            invoiceNumber: 'INV-2026-0001',
            bookingId,
            issuedAt: new Date('2026-07-01T10:05:00.000Z'),
            totalEur: 216,
            vatEur: 36,
          },
        ]),
      );

      const result = await repository.getRgpdExportData(userId.toString());

      expect(result.bookings).toEqual([
        {
          bookingId: bookingId.toString(),
          slotId: slotId.toString(),
          status: 'confirmed',
          totalEur: 216,
          vatEur: 36,
          participantsCount: 2,
          createdAt: '2026-07-01T10:00:00.000Z',
        },
      ]);
      expect(result.invoices).toEqual([
        {
          invoiceId: invoiceId.toString(),
          invoiceNumber: 'INV-2026-0001',
          bookingId: bookingId.toString(),
          issuedAt: '2026-07-01T10:05:00.000Z',
          totalEur: 216,
          vatEur: 36,
        },
      ]);
    });

    it('should default participantsCount to 0 and createdAt to undefined', async () => {
      bookingModel.find.mockReturnValue(
        mockQuery([
          {
            _id: 'b1',
            slotId: 's1',
            status: 'pending_payment',
            totalEur: 100,
            vatEur: 20,
          },
        ]),
      );
      invoiceModel.find.mockReturnValue(mockQuery([]));

      const result = await repository.getRgpdExportData(userId.toString());

      expect(result.bookings[0].participantsCount).toBe(0);
      expect(result.bookings[0].createdAt).toBeUndefined();
    });

    it('should stringify an issuedAt that is not a Date', async () => {
      bookingModel.find.mockReturnValue(mockQuery([]));
      invoiceModel.find.mockReturnValue(
        mockQuery([
          {
            _id: 'i1',
            invoiceNumber: 'INV-1',
            bookingId: 'b1',
            issuedAt: '2026-07-01',
            totalEur: 10,
            vatEur: 2,
          },
        ]),
      );

      const result = await repository.getRgpdExportData(userId.toString());

      expect(result.invoices[0].issuedAt).toBe('2026-07-01');
    });

    it('should sort the bookings and the invoices by descending date', async () => {
      const bookingQuery = mockQuery([]);
      const invoiceQuery = mockQuery([]);
      bookingModel.find.mockReturnValue(bookingQuery);
      invoiceModel.find.mockReturnValue(invoiceQuery);

      await repository.getRgpdExportData(userId.toString());

      expect(bookingQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(invoiceQuery.sort).toHaveBeenCalledWith({ issuedAt: -1 });
      expect(bookingQuery.lean).toHaveBeenCalled();
      expect(invoiceQuery.lean).toHaveBeenCalled();
    });
  });

  describe('getDashboard()', () => {
    const buildActivity = (suffix: string) => ({
      _id: new Types.ObjectId(),
      title: `Activite ${suffix}`,
      type: 'climbing',
      priceFromEur: 90,
      difficulty: 'beginner',
      coverPhotoUrl: `file_${suffix}`,
    });

    // Cable les 4 requetes de getDashboard dans leur ordre d'appel
    const stubDashboard = (options: {
      upcoming?: unknown[];
      bookedTypes?: Array<{ type: string }>;
      preferred?: unknown[];
      random?: unknown[];
      userDoc?: unknown;
    }) => {
      bookingModel.aggregate
        .mockReturnValueOnce(mockAggregate(options.upcoming ?? []))
        .mockReturnValueOnce(mockAggregate(options.bookedTypes ?? []));

      if (options.preferred !== undefined) {
        activityModel.aggregate.mockReturnValueOnce(
          mockAggregate(options.preferred),
        );
      }
      if (options.random !== undefined) {
        activityModel.aggregate.mockReturnValueOnce(
          mockAggregate(options.random),
        );
      }

      // 'userDoc' in options permet de cabler explicitement un document null
      userModel.findById.mockReturnValue(
        mockQuery(
          'userDoc' in options ? options.userDoc : { firstName: 'Remi' },
        ),
      );
    };

    it('should return an empty dashboard for an invalid user id', async () => {
      const result = await repository.getDashboard('not-an-object-id');

      expect(result).toEqual({
        firstName: '',
        upcomingBookings: [],
        suggestedActivities: [],
      });
      expect(bookingModel.aggregate).not.toHaveBeenCalled();
    });

    it('should return the first name of the user', async () => {
      stubDashboard({ random: [] });

      const result = await repository.getDashboard(userId.toString());

      expect(result.firstName).toBe('Remi');
    });

    it('should default the first name to an empty string when the user is missing', async () => {
      stubDashboard({ random: [], userDoc: null });

      const result = await repository.getDashboard(userId.toString());

      expect(result.firstName).toBe('');
    });

    it('should return an empty list when no upcoming booking exists', async () => {
      stubDashboard({ random: [] });

      const result = await repository.getDashboard(userId.toString());

      expect(result.upcomingBookings).toEqual([]);
    });

    it('should map the upcoming bookings', async () => {
      const bookingId = new Types.ObjectId();
      stubDashboard({
        upcoming: [
          {
            _id: bookingId,
            status: 'confirmed',
            slotStartAt: new Date('2026-09-05T09:00:00.000Z'),
            activityTitle: 'Escalade Fontainebleau',
          },
        ],
        random: [],
      });

      const result = await repository.getDashboard(userId.toString());

      expect(result.upcomingBookings).toEqual([
        {
          bookingId: bookingId.toString(),
          activityTitle: 'Escalade Fontainebleau',
          slotStartAt: '2026-09-05T09:00:00.000Z',
          status: 'confirmed',
        },
      ]);
    });

    it('should default a missing activity title and stringify a non Date start', async () => {
      stubDashboard({
        upcoming: [
          {
            _id: new Types.ObjectId(),
            status: 'partial_paid',
            slotStartAt: '2026-09-06T09:00:00.000Z',
          },
        ],
        random: [],
      });

      const result = await repository.getDashboard(userId.toString());

      expect(result.upcomingBookings[0].activityTitle).toBe('');
      expect(result.upcomingBookings[0].slotStartAt).toBe(
        '2026-09-06T09:00:00.000Z',
      );
    });

    it('should limit the booking pipeline to 3 confirmed or partially paid bookings', async () => {
      stubDashboard({ random: [] });

      await repository.getDashboard(userId.toString());

      const pipeline = bookingModel.aggregate.mock
        .calls[0][0] as PipelineStage[];
      expect(pipeline[0]).toEqual({
        $match: {
          userId: expect.any(Types.ObjectId),
          status: { $in: ['confirmed', 'partial_paid'] },
        },
      });
      expect(pipeline).toContainEqual({ $limit: 3 });
    });

    it('should only run the random pipeline when the user booked nothing yet', async () => {
      stubDashboard({ bookedTypes: [], random: [] });

      await repository.getDashboard(userId.toString());

      expect(activityModel.aggregate).toHaveBeenCalledTimes(1);
      const pipeline = activityModel.aggregate.mock
        .calls[0][0] as PipelineStage[];
      expect(pipeline[0]).toEqual({
        $match: { status: 'published', _id: { $nin: [] } },
      });
      expect(pipeline).toContainEqual({ $sample: { size: 4 } });
    });

    it('should only run the preferred pipeline when it already returns 4 activities', async () => {
      const preferred = [
        buildActivity('1'),
        buildActivity('2'),
        buildActivity('3'),
        buildActivity('4'),
      ];
      stubDashboard({
        bookedTypes: [{ type: 'climbing' }],
        preferred,
      });

      const result = await repository.getDashboard(userId.toString());

      expect(activityModel.aggregate).toHaveBeenCalledTimes(1);
      const pipeline = activityModel.aggregate.mock
        .calls[0][0] as PipelineStage[];
      expect(pipeline[0]).toEqual({
        $match: { status: 'published', type: { $in: ['climbing'] } },
      });
      expect(result.suggestedActivities).toHaveLength(4);
    });

    it('should complete the preferred activities with random ones', async () => {
      const preferred = [buildActivity('1'), buildActivity('2')];
      const random = [buildActivity('3'), buildActivity('4')];
      stubDashboard({
        bookedTypes: [{ type: 'climbing' }, { type: 'diving' }],
        preferred,
        random,
      });

      const result = await repository.getDashboard(userId.toString());

      expect(activityModel.aggregate).toHaveBeenCalledTimes(2);
      const randomPipeline = activityModel.aggregate.mock
        .calls[1][0] as PipelineStage[];
      expect(randomPipeline[0]).toEqual({
        $match: {
          status: 'published',
          _id: { $nin: [preferred[0]._id, preferred[1]._id] },
        },
      });
      expect(randomPipeline).toContainEqual({ $sample: { size: 2 } });
      expect(result.suggestedActivities).toHaveLength(4);
    });

    it('should map the suggested activities', async () => {
      const activity = buildActivity('1');
      stubDashboard({ bookedTypes: [], random: [activity] });

      const result = await repository.getDashboard(userId.toString());

      expect(result.suggestedActivities[0]).toEqual({
        activityId: activity._id.toString(),
        title: 'Activite 1',
        type: 'climbing',
        priceFromEur: 90,
        difficulty: 'beginner',
        coverPhotoUrl: 'file_1',
      });
    });

    it('should default a missing cover photo to an empty string', async () => {
      stubDashboard({
        bookedTypes: [],
        random: [{ ...buildActivity('1'), coverPhotoUrl: undefined }],
      });

      const result = await repository.getDashboard(userId.toString());

      expect(result.suggestedActivities[0].coverPhotoUrl).toBe('');
    });

    it('should select only the first name of the user document', async () => {
      const query = mockQuery({ firstName: 'Remi' });
      bookingModel.aggregate
        .mockReturnValueOnce(mockAggregate([]))
        .mockReturnValueOnce(mockAggregate([]));
      activityModel.aggregate.mockReturnValueOnce(mockAggregate([]));
      userModel.findById.mockReturnValue(query);

      await repository.getDashboard(userId.toString());

      expect(query.select).toHaveBeenCalledWith('firstName');
      expect(query.lean).toHaveBeenCalled();
    });
  });
});
