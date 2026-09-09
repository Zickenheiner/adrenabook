import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { UserMapper } from './user.mapper';
import { UserDocument } from '@features/auth/domains/schemas/user.schema';

describe('UserMapper', () => {
  let mapper: UserMapper;

  const objectId = new Types.ObjectId();

  // Fabrique un faux document Mongoose : seules les proprietes lues par le
  // mapper sont necessaires, d'ou le double cast.
  const buildDocument = (
    overrides: Record<string, unknown> = {},
  ): UserDocument =>
    ({
      _id: objectId,
      email: 'aventurier@example.com',
      password: 'hashed-password',
      firstName: 'Remi',
      lastName: 'Durand',
      birthDate: new Date('1990-05-12T00:00:00.000Z'),
      acceptCgu: true,
      acceptRgpd: true,
      emailVerified: true,
      emailVerificationToken: 'token-abc',
      role: 'aventurier',
      status: 'active',
      failedLoginAttempts: 2,
      lockedUntil: new Date('2026-09-01T10:00:00.000Z'),
      twoFactorEnabled: true,
      twoFactorCode: '123456',
      twoFactorCodeExpiresAt: new Date('2026-09-01T10:05:00.000Z'),
      refreshTokenHash: 'refresh-hash',
      passwordResetTokenHash: 'reset-hash',
      passwordResetTokenExpiresAt: new Date('2026-09-01T11:00:00.000Z'),
      healthProfile: {
        weight: 72,
        height: 180,
        medicalContraindications: ['encrypted-1'],
        emergencyContact: {
          fullName: 'Marie Durand',
          relation: 'soeur',
          phone: '+33600000000',
        },
        medicalCertificateFileId: 'file_123',
      },
      notificationPreferences: {
        email: {
          bookingConfirmation: true,
          reminders: false,
          marketing: false,
        },
        sms: { bookingConfirmation: true, reminders: true },
      },
      rgpdRequest: {
        requestId: 'req-1',
        requestType: 'export',
        status: 'completed',
        requestedAt: new Date('2026-08-01T00:00:00.000Z'),
        completedAt: new Date('2026-08-01T00:01:00.000Z'),
      },
      ...overrides,
    }) as unknown as UserDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserMapper],
    }).compile();
    mapper = module.get<UserMapper>(UserMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('toEntity()', () => {
    it('should map every scalar field of the document', () => {
      const doc = buildDocument();

      const entity = mapper.toEntity(doc);

      expect(entity.getId()).toBe(objectId.toString());
      expect(entity.getEmail()).toBe('aventurier@example.com');
      expect(entity.getPassword()).toBe('hashed-password');
      expect(entity.getFirstName()).toBe('Remi');
      expect(entity.getLastName()).toBe('Durand');
      expect(entity.getBirthDate()).toEqual(
        new Date('1990-05-12T00:00:00.000Z'),
      );
      expect(entity.getAcceptCgu()).toBe(true);
      expect(entity.getAcceptRgpd()).toBe(true);
      expect(entity.getEmailVerified()).toBe(true);
      expect(entity.getEmailVerificationToken()).toBe('token-abc');
      expect(entity.getRole()).toBe('aventurier');
    });

    it('should map the security fields', () => {
      const entity = mapper.toEntity(buildDocument());

      expect(entity.getFailedLoginAttempts()).toBe(2);
      expect(entity.getLockedUntil()).toEqual(
        new Date('2026-09-01T10:00:00.000Z'),
      );
      expect(entity.getTwoFactorEnabled()).toBe(true);
      expect(entity.getTwoFactorCode()).toBe('123456');
      expect(entity.getTwoFactorCodeExpiresAt()).toEqual(
        new Date('2026-09-01T10:05:00.000Z'),
      );
      expect(entity.getRefreshTokenHash()).toBe('refresh-hash');
      expect(entity.getPasswordResetTokenHash()).toBe('reset-hash');
      expect(entity.getPasswordResetTokenExpiresAt()).toEqual(
        new Date('2026-09-01T11:00:00.000Z'),
      );
    });

    it('should map the nested objects (health, notifications, rgpd)', () => {
      const doc = buildDocument();

      const entity = mapper.toEntity(doc);

      expect(entity.getHealthProfile()).toEqual(
        (doc as unknown as { healthProfile: unknown }).healthProfile,
      );
      expect(entity.getNotificationPreferences()).toEqual(
        (doc as unknown as { notificationPreferences: unknown })
          .notificationPreferences,
      );
      expect(entity.getRgpdRequest()).toEqual(
        (doc as unknown as { rgpdRequest: unknown }).rgpdRequest,
      );
    });

    it('should default the status to "active" when the document has none', () => {
      const entity = mapper.toEntity(buildDocument({ status: undefined }));

      expect(entity.getStatus()).toBe('active');
    });

    it('should keep the document status when it is set', () => {
      const entity = mapper.toEntity(buildDocument({ status: 'suspended' }));

      expect(entity.getStatus()).toBe('suspended');
    });

    it('should map optional fields to undefined when they are absent', () => {
      const entity = mapper.toEntity(
        buildDocument({
          emailVerificationToken: undefined,
          lockedUntil: undefined,
          twoFactorCode: undefined,
          twoFactorCodeExpiresAt: undefined,
          refreshTokenHash: undefined,
          passwordResetTokenHash: undefined,
          passwordResetTokenExpiresAt: undefined,
          healthProfile: undefined,
          notificationPreferences: undefined,
          rgpdRequest: undefined,
        }),
      );

      expect(entity.getEmailVerificationToken()).toBeUndefined();
      expect(entity.getLockedUntil()).toBeUndefined();
      expect(entity.getTwoFactorCode()).toBeUndefined();
      expect(entity.getRefreshTokenHash()).toBeUndefined();
      expect(entity.getPasswordResetTokenHash()).toBeUndefined();
      expect(entity.getHealthProfile()).toBeUndefined();
      expect(entity.getNotificationPreferences()).toBeUndefined();
      expect(entity.getRgpdRequest()).toBeUndefined();
    });
  });
});
