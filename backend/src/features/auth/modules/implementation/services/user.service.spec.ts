import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import * as argon2 from 'argon2';
import { UserService } from './user.service';
import { UserEntity } from '@features/auth/domains/entities/user.entity';
import {
  HealthProfileDto,
  LoginDto,
  NotificationPreferencesDto,
  RegisterDto,
  RgpdDeleteDto,
} from '@features/auth/domains/dtos/user.dto';

jest.mock('argon2');

const hashMock = argon2.hash as jest.Mock;
const verifyMock = argon2.verify as jest.Mock;

/**
 * Cle AES-256 valide (64 caracteres hex = 32 bytes) utilisee par les tests
 * de chiffrement du profil de sante.
 */
const TEST_AES_KEY =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

const DEFAULT_CONFIG: Record<string, string | undefined> = {
  ACCESS_TOKEN_SECRET: 'at-secret',
  REFRESH_TOKEN_SECRET: 'rt-secret',
  PASSWORD_RESET_SECRET: 'pr-secret',
  HEALTH_ENCRYPTION_KEY: TEST_AES_KEY,
};

const RGPD_UNDECRYPTABLE_MARKER =
  '[donnee illisible : chiffrement obsolete ou cle invalide]';

/**
 * Description partielle d'un utilisateur, utilisee pour construire une
 * UserEntity de test via ses setters.
 */
interface UserSeed {
  id?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: any;
  role?: string;
  status?: string;
  emailVerified?: boolean;
  acceptCgu?: boolean;
  acceptRgpd?: boolean;
  failedLoginAttempts?: number;
  lockedUntil?: Date;
  twoFactorEnabled?: boolean;
  twoFactorCode?: string;
  twoFactorCodeExpiresAt?: Date;
  refreshTokenHash?: string;
  passwordResetTokenHash?: string;
  passwordResetTokenExpiresAt?: Date;
  healthProfile?: any;
  notificationPreferences?: any;
  rgpdRequest?: any;
}

const buildUser = (seed: UserSeed = {}): UserEntity => {
  const user = new UserEntity((seed.id ?? 'user-1') as any);
  user.setEmail(seed.email ?? 'adventurer@example.com');
  user.setPassword(seed.password ?? 'stored-hash');
  user.setFirstName(seed.firstName ?? 'Lara');
  user.setLastName(seed.lastName ?? 'Croft');
  user.setBirthDate(
    seed.birthDate === undefined ? new Date('1990-01-01') : seed.birthDate,
  );
  user.setRole(seed.role ?? 'aventurier');
  user.setStatus(seed.status ?? 'active');
  user.setEmailVerified(seed.emailVerified ?? true);
  user.setAcceptCgu(seed.acceptCgu ?? true);
  user.setAcceptRgpd(seed.acceptRgpd ?? true);
  user.setFailedLoginAttempts(seed.failedLoginAttempts ?? 0);
  user.setLockedUntil(seed.lockedUntil);
  user.setTwoFactorEnabled(seed.twoFactorEnabled ?? false);
  user.setTwoFactorCode(seed.twoFactorCode);
  user.setTwoFactorCodeExpiresAt(seed.twoFactorCodeExpiresAt);
  user.setRefreshTokenHash(seed.refreshTokenHash);
  user.setPasswordResetTokenHash(seed.passwordResetTokenHash);
  user.setPasswordResetTokenExpiresAt(seed.passwordResetTokenExpiresAt);
  user.setHealthProfile(seed.healthProfile);
  user.setNotificationPreferences(seed.notificationPreferences);
  user.setRgpdRequest(seed.rgpdRequest);
  return user;
};

const buildRegisterDto = (overrides: Partial<RegisterDto> = {}): RegisterDto =>
  ({
    email: 'new@example.com',
    password: 'Sup3rS3cret!',
    firstName: 'Lara',
    lastName: 'Croft',
    birthDate: '1990-01-01',
    acceptCgu: true,
    acceptRgpd: true,
    ...overrides,
  }) as RegisterDto;

const buildHealthProfileDto = (
  overrides: Partial<HealthProfileDto> = {},
): HealthProfileDto =>
  ({
    weight: 70,
    height: 180,
    emergencyContact: {
      fullName: 'Winston',
      relation: 'butler',
      phone: '+33600000000',
    },
    ...overrides,
  }) as HealthProfileDto;

const buildNotificationPreferencesDto = (): NotificationPreferencesDto =>
  ({
    email: { bookingConfirmation: true, reminders: true, marketing: false },
    sms: { bookingConfirmation: true, reminders: false },
  }) as NotificationPreferencesDto;

describe('UserService', () => {
  let service: UserService;
  let userRepository: Record<string, jest.Mock>;
  let loginLogRepository: { create: jest.Mock };
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  let configValues: Record<string, string | undefined>;

  const buildModule = async (
    configOverride?: Record<string, string | undefined>,
  ): Promise<TestingModule> => {
    configValues = configOverride ?? { ...DEFAULT_CONFIG };

    userRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      register: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      incrementFailedAttempts: jest.fn(),
      lockAccount: jest.fn().mockResolvedValue(true),
      resetFailedAttempts: jest.fn().mockResolvedValue(true),
      setTwoFactorCode: jest.fn().mockResolvedValue(true),
      clearTwoFactorCode: jest.fn().mockResolvedValue(true),
      setRefreshTokenHash: jest.fn().mockResolvedValue(true),
      setPasswordResetToken: jest.fn().mockResolvedValue(true),
      clearPasswordResetToken: jest.fn().mockResolvedValue(true),
      updatePassword: jest.fn().mockResolvedValue(true),
      clearRefreshTokenHash: jest.fn().mockResolvedValue(true),
      updateHealthProfile: jest.fn().mockResolvedValue(true),
      updateNotificationPreferences: jest.fn().mockResolvedValue(true),
      updateStatus: jest.fn().mockResolvedValue(true),
      setRgpdExportCompleted: jest.fn().mockResolvedValue(true),
      getRgpdExportData: jest
        .fn()
        .mockResolvedValue({ bookings: [], invoices: [] }),
      setRgpdDeleteRequest: jest.fn().mockResolvedValue(true),
      getRgpdRequest: jest.fn(),
      getDashboard: jest.fn(),
    };

    loginLogRepository = { create: jest.fn().mockResolvedValue(null) };

    jwtService = {
      signAsync: jest
        .fn()
        .mockImplementation((_payload: unknown, options: any) =>
          Promise.resolve(
            options?.expiresIn === '15m' ? 'access-token' : 'refresh-token',
          ),
        ),
      verifyAsync: jest.fn(),
    };

    return Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'IUserRepository', useValue: userRepository },
        { provide: 'ILoginLogRepository', useValue: loginLogRepository },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => configValues[key]),
          },
        },
      ],
    }).compile();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    hashMock.mockImplementation((value: string) =>
      Promise.resolve(`hashed:${value}`),
    );
    verifyMock.mockResolvedValue(true);

    const module = await buildModule();
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ——— Delegations simples ———

  describe('findAll()', () => {
    it('should delegate to the repository', async () => {
      const users = [buildUser()];
      userRepository.findAll.mockResolvedValue(users);

      await expect(service.findAll()).resolves.toBe(users);
      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById()', () => {
    it('should delegate to the repository', async () => {
      const user = buildUser();
      userRepository.findById.mockResolvedValue(user);

      await expect(service.findById('user-1')).resolves.toBe(user);
      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
    });
  });

  describe('create()', () => {
    it('should delegate to the repository', async () => {
      userRepository.create.mockResolvedValue(true);

      await expect(service.create({} as any)).resolves.toBe(true);
      expect(userRepository.create).toHaveBeenCalledWith({});
    });
  });

  describe('update()', () => {
    it('should delegate to the repository', async () => {
      userRepository.update.mockResolvedValue(true);

      await expect(service.update('user-1', {} as any)).resolves.toBe(true);
      expect(userRepository.update).toHaveBeenCalledWith('user-1', {});
    });
  });

  describe('delete()', () => {
    it('should delegate to the repository', async () => {
      userRepository.delete.mockResolvedValue(false);

      await expect(service.delete('user-1')).resolves.toBe(false);
      expect(userRepository.delete).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getDashboard()', () => {
    it('should delegate to the repository', async () => {
      const dashboard = {
        firstName: 'Lara',
        upcomingBookings: [],
        suggestedActivities: [],
      };
      userRepository.getDashboard.mockResolvedValue(dashboard);

      await expect(service.getDashboard('user-1')).resolves.toBe(dashboard);
      expect(userRepository.getDashboard).toHaveBeenCalledWith('user-1');
    });
  });

  // ——— Inscription US-01 ———

  describe('register()', () => {
    it('should hash the password, generate a verification token and persist the user', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.register.mockResolvedValue(
        buildUser({ id: 'created-1', email: 'new@example.com' }),
      );

      const dto = buildRegisterDto();
      const result = await service.register(dto);

      expect(hashMock).toHaveBeenCalledWith(dto.password);
      const [, hashedPassword, token] = userRepository.register.mock.calls[0];
      expect(hashedPassword).toBe(`hashed:${dto.password}`);
      expect(token).toMatch(/^[0-9a-f]{64}$/);
      expect(result).toEqual({
        userId: 'created-1',
        email: 'new@example.com',
        emailVerificationSent: true,
      });
    });

    it('should throw BadRequestException when the CGU are not accepted', async () => {
      await expect(
        service.register(buildRegisterDto({ acceptCgu: false })),
      ).rejects.toThrow(BadRequestException);
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the RGPD policy is not accepted', async () => {
      await expect(
        service.register(buildRegisterDto({ acceptRgpd: false })),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when the birth date is not parsable', async () => {
      await expect(
        service.register(buildRegisterDto({ birthDate: 'not-a-date' })),
      ).rejects.toThrow('La date de naissance est invalide');
    });

    it('should throw BadRequestException when the user is under 18', async () => {
      const almostEighteen = new Date();
      almostEighteen.setFullYear(almostEighteen.getFullYear() - 17);

      await expect(
        service.register(
          buildRegisterDto({
            birthDate: almostEighteen.toISOString().slice(0, 10),
          }),
        ),
      ).rejects.toThrow(
        'Vous devez etre majeur (18 ans minimum) pour vous inscrire',
      );
    });

    it('should decrement the age when the birthday has not occurred yet this year', async () => {
      // Aujourd'hui fige au 1er janvier : un anniversaire en decembre n'est pas
      // encore passe, l'utilisateur a donc 17 ans revolus et non 18.
      jest.useFakeTimers().setSystemTime(new Date('2026-01-01T12:00:00Z'));

      await expect(
        service.register(buildRegisterDto({ birthDate: '2008-12-31' })),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when the email is already taken', async () => {
      userRepository.findByEmail.mockResolvedValue(buildUser());

      await expect(service.register(buildRegisterDto())).rejects.toThrow(
        ConflictException,
      );
      expect(userRepository.register).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when the repository returns null', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.register.mockResolvedValue(null);

      await expect(service.register(buildRegisterDto())).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ——— Connexion US-02 ———

  describe('login()', () => {
    const loginDto = (overrides: Partial<LoginDto> = {}): LoginDto =>
      ({
        email: 'adventurer@example.com',
        password: 'Sup3rS3cret!',
        ...overrides,
      }) as LoginDto;

    it('should return tokens and the public user on success', async () => {
      const user = buildUser({ role: 'professionnel' });
      userRepository.findByEmail.mockResolvedValue(user);

      const result = await service.login(loginDto(), {
        ipAddress: '10.0.0.1',
        userAgent: 'jest',
      });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-1',
          email: 'adventurer@example.com',
          role: 'professionnel',
        },
      });
      expect(userRepository.resetFailedAttempts).toHaveBeenCalledWith('user-1');
      expect(userRepository.setRefreshTokenHash).toHaveBeenCalledWith(
        'user-1',
        'hashed:refresh-token',
      );
      expect(loginLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'adventurer@example.com',
          success: true,
          reason: 'login_success',
          ipAddress: '10.0.0.1',
          userAgent: 'jest',
        }),
      );
    });

    it('should sign both tokens with their dedicated secret and TTL', async () => {
      userRepository.findByEmail.mockResolvedValue(buildUser());

      await service.login(loginDto());

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-1', email: 'adventurer@example.com', role: 'aventurier' },
        { secret: 'at-secret', expiresIn: '15m' },
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-1', email: 'adventurer@example.com', role: 'aventurier' },
        { secret: 'rt-secret', expiresIn: '7d' },
      );
    });

    it('should fall back to default secrets when the config is empty', async () => {
      const module = await buildModule({});
      service = module.get<UserService>(UserService);
      userRepository.findByEmail.mockResolvedValue(buildUser());

      await service.login(loginDto());

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ secret: 'change-me-at' }),
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ secret: 'change-me-rt' }),
      );
    });

    it('should normalize the admin role', async () => {
      userRepository.findByEmail.mockResolvedValue(
        buildUser({ role: 'ADMIN' }),
      );

      const result = await service.login(loginDto());

      expect(result.user.role).toBe('admin');
    });

    it('should fall back to the aventurier role for an unknown role', async () => {
      userRepository.findByEmail.mockResolvedValue(
        buildUser({ role: undefined as any }),
      );

      const result = await service.login(loginDto());

      expect(result.user.role).toBe('aventurier');
    });

    it('should throw UnauthorizedException and log when the user does not exist', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto())).rejects.toThrow(
        UnauthorizedException,
      );
      expect(loginLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, reason: 'user_not_found' }),
      );
    });

    it('should throw HTTP 423 when the account is still locked', async () => {
      userRepository.findByEmail.mockResolvedValue(
        buildUser({ lockedUntil: new Date(Date.now() + 60_000) }),
      );

      await expect(service.login(loginDto())).rejects.toMatchObject({
        status: HttpStatus.LOCKED,
      });
      expect(loginLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ reason: 'account_locked' }),
      );
      expect(verifyMock).not.toHaveBeenCalled();
    });

    it('should accept the login when the lock has expired', async () => {
      userRepository.findByEmail.mockResolvedValue(
        buildUser({ lockedUntil: new Date(Date.now() - 60_000) }),
      );

      await expect(service.login(loginDto())).resolves.toMatchObject({
        accessToken: 'access-token',
      });
    });

    it('should increment the failed attempts and throw 401 on a wrong password', async () => {
      userRepository.findByEmail.mockResolvedValue(buildUser());
      verifyMock.mockResolvedValue(false);
      userRepository.incrementFailedAttempts.mockResolvedValue(
        buildUser({ failedLoginAttempts: 2 }),
      );

      await expect(service.login(loginDto())).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.incrementFailedAttempts).toHaveBeenCalledWith(
        'user-1',
      );
      expect(userRepository.lockAccount).not.toHaveBeenCalled();
      expect(loginLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ reason: 'invalid_password' }),
      );
    });

    it('should throw 401 when incrementFailedAttempts returns null', async () => {
      userRepository.findByEmail.mockResolvedValue(buildUser());
      verifyMock.mockResolvedValue(false);
      userRepository.incrementFailedAttempts.mockResolvedValue(null);

      await expect(service.login(loginDto())).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.lockAccount).not.toHaveBeenCalled();
    });

    it('should lock the account for 15 minutes at the 5th failed attempt', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-08-20T10:00:00Z'));
      userRepository.findByEmail.mockResolvedValue(buildUser());
      verifyMock.mockResolvedValue(false);
      userRepository.incrementFailedAttempts.mockResolvedValue(
        buildUser({ failedLoginAttempts: 5 }),
      );

      await expect(service.login(loginDto())).rejects.toMatchObject({
        status: HttpStatus.LOCKED,
      });
      expect(userRepository.lockAccount).toHaveBeenCalledWith(
        'user-1',
        new Date('2026-08-20T10:15:00Z'),
      );
      expect(loginLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ reason: 'account_locked_after_attempts' }),
      );
    });

    it('should generate and store a 2FA code when 2FA is enabled and no code is provided', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-08-20T10:00:00Z'));
      userRepository.findByEmail.mockResolvedValue(
        buildUser({ twoFactorEnabled: true }),
      );

      await expect(service.login(loginDto())).rejects.toThrow(
        'Code 2FA requis. Un code a ete envoye a votre adresse email.',
      );

      const [id, hashedCode, expiresAt] =
        userRepository.setTwoFactorCode.mock.calls[0];
      expect(id).toBe('user-1');
      expect(hashedCode).toMatch(/^hashed:\d{6}$/);
      expect(expiresAt).toEqual(new Date('2026-08-20T10:10:00Z'));
      expect(loginLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ reason: '2fa_required' }),
      );
    });

    it('should throw UnauthorizedException when no 2FA code is stored', async () => {
      userRepository.findByEmail.mockResolvedValue(
        buildUser({ twoFactorEnabled: true }),
      );

      await expect(
        service.login(loginDto({ twoFactorCode: '123456' })),
      ).rejects.toThrow('Code 2FA expire ou invalide');
      expect(loginLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ reason: '2fa_code_expired' }),
      );
    });

    it('should throw UnauthorizedException when the stored 2FA code has expired', async () => {
      userRepository.findByEmail.mockResolvedValue(
        buildUser({
          twoFactorEnabled: true,
          twoFactorCode: 'hashed:123456',
          twoFactorCodeExpiresAt: new Date(Date.now() - 1000),
        }),
      );

      await expect(
        service.login(loginDto({ twoFactorCode: '123456' })),
      ).rejects.toThrow('Code 2FA expire ou invalide');
    });

    it('should throw UnauthorizedException when the 2FA code does not match', async () => {
      userRepository.findByEmail.mockResolvedValue(
        buildUser({
          twoFactorEnabled: true,
          twoFactorCode: 'hashed:123456',
          twoFactorCodeExpiresAt: new Date(Date.now() + 60_000),
        }),
      );
      verifyMock
        .mockResolvedValueOnce(true) // mot de passe valide
        .mockResolvedValueOnce(false); // code 2FA invalide

      await expect(
        service.login(loginDto({ twoFactorCode: '999999' })),
      ).rejects.toThrow('Code 2FA invalide');
      expect(loginLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ reason: '2fa_code_invalid' }),
      );
    });

    it('should clear the 2FA code and log in when the code is valid', async () => {
      userRepository.findByEmail.mockResolvedValue(
        buildUser({
          twoFactorEnabled: true,
          twoFactorCode: 'hashed:123456',
          twoFactorCodeExpiresAt: new Date(Date.now() + 60_000),
        }),
      );

      const result = await service.login(loginDto({ twoFactorCode: '123456' }));

      expect(userRepository.clearTwoFactorCode).toHaveBeenCalledWith('user-1');
      expect(result.accessToken).toBe('access-token');
    });

    it('should not fail the login when the login log repository throws', async () => {
      userRepository.findByEmail.mockResolvedValue(buildUser());
      loginLogRepository.create.mockRejectedValue(new Error('mongo down'));

      await expect(service.login(loginDto())).resolves.toMatchObject({
        accessToken: 'access-token',
      });
    });
  });

  // ——— Rotation du refresh token US-02 ———

  describe('refreshTokens()', () => {
    it('should rotate the refresh token on success', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
      userRepository.findById.mockResolvedValue(
        buildUser({ refreshTokenHash: 'hashed:old-rt' }),
      );

      const result = await service.refreshTokens('old-rt');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('old-rt', {
        secret: 'rt-secret',
      });
      expect(verifyMock).toHaveBeenCalledWith('hashed:old-rt', 'old-rt');
      expect(userRepository.setRefreshTokenHash).toHaveBeenCalledWith(
        'user-1',
        'hashed:refresh-token',
      );
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-1',
          email: 'adventurer@example.com',
          role: 'aventurier',
        },
      });
    });

    it('should use the default refresh secret when the config is empty', async () => {
      const module = await buildModule({});
      service = module.get<UserService>(UserService);
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
      userRepository.findById.mockResolvedValue(
        buildUser({ refreshTokenHash: 'hashed:old-rt' }),
      );

      await service.refreshTokens('old-rt');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('old-rt', {
        secret: 'change-me-rt',
      });
    });

    it('should throw UnauthorizedException when the token signature is invalid or expired', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(service.refreshTokens('bad-rt')).rejects.toThrow(
        'Refresh token invalide ou expire',
      );
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when the user no longer exists', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'ghost' });
      userRepository.findById.mockResolvedValue(null);

      await expect(service.refreshTokens('old-rt')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException when the account is not active', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
      userRepository.findById.mockResolvedValue(
        buildUser({ status: 'suspended', refreshTokenHash: 'hashed:old-rt' }),
      );

      await expect(service.refreshTokens('old-rt')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw UnauthorizedException when no session hash is stored (logged out)', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
      userRepository.findById.mockResolvedValue(buildUser());

      await expect(service.refreshTokens('old-rt')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(verifyMock).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when the token has already been rotated', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
      userRepository.findById.mockResolvedValue(
        buildUser({ refreshTokenHash: 'hashed:current-rt' }),
      );
      verifyMock.mockResolvedValue(false);

      await expect(service.refreshTokens('rotated-rt')).rejects.toThrow(
        'Refresh token invalide ou expire',
      );
      expect(userRepository.setRefreshTokenHash).not.toHaveBeenCalled();
    });
  });

  // ——— Reinitialisation du mot de passe US-03 ———

  describe('requestPasswordReset()', () => {
    it('should store a signed hashed token and return the generic message', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-08-20T10:00:00Z'));
      userRepository.findByEmail.mockResolvedValue(buildUser());

      const result = await service.requestPasswordReset({
        email: 'adventurer@example.com',
      });

      const [userId, hashedToken, expiresAt] =
        userRepository.setPasswordResetToken.mock.calls[0];
      expect(userId).toBe('user-1');
      expect(expiresAt).toEqual(new Date('2026-08-20T11:00:00Z'));

      // Le token signe suit le format userId.expiresAtSec.rawToken.signature
      const signedToken = hashedToken.replace(/^hashed:/, '');
      const parts = signedToken.split('.');
      expect(parts).toHaveLength(4);
      expect(parts[0]).toBe('user-1');
      const expectedSignature = createHmac('sha256', 'pr-secret')
        .update(parts.slice(0, 3).join('.'))
        .digest('hex');
      expect(parts[3]).toBe(expectedSignature);

      expect(result.message).toContain('Si un compte existe pour cet email');
    });

    it('should return the same generic message for an unknown email without touching the repository', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await service.requestPasswordReset({
        email: 'ghost@example.com',
      });

      expect(userRepository.setPasswordResetToken).not.toHaveBeenCalled();
      expect(result.message).toBe(
        'Si un compte existe pour cet email, un lien de reinitialisation a ete envoye.',
      );
    });
  });

  describe('confirmPasswordReset()', () => {
    /**
     * Fabrique un token de reinitialisation signe avec le secret attendu.
     */
    const signToken = (
      userId: string,
      expiresAtSec: number,
      secret = 'pr-secret',
      rawToken = 'a1b2c3',
    ): string => {
      const payload = `${userId}.${expiresAtSec}.${rawToken}`;
      const signature = createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      return `${payload}.${signature}`;
    };

    const futureSec = (): number => Math.floor(Date.now() / 1000) + 3600;

    it('should reset the password, burn the token and invalidate the sessions', async () => {
      const token = signToken('user-1', futureSec());
      userRepository.findById.mockResolvedValue(
        buildUser({
          passwordResetTokenHash: `hashed:${token}`,
          passwordResetTokenExpiresAt: new Date(Date.now() + 3_600_000),
        }),
      );

      const result = await service.confirmPasswordReset({
        token,
        newPassword: 'N3wS3cret!',
      });

      expect(userRepository.updatePassword).toHaveBeenCalledWith(
        'user-1',
        'hashed:N3wS3cret!',
      );
      expect(userRepository.clearPasswordResetToken).toHaveBeenCalledWith(
        'user-1',
      );
      expect(userRepository.clearRefreshTokenHash).toHaveBeenCalledWith(
        'user-1',
      );
      expect(userRepository.resetFailedAttempts).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ message: 'Mot de passe modifie avec succes' });
    });

    it('should fall back to ACCESS_TOKEN_SECRET when PASSWORD_RESET_SECRET is missing', async () => {
      const module = await buildModule({
        ACCESS_TOKEN_SECRET: 'at-secret',
        HEALTH_ENCRYPTION_KEY: TEST_AES_KEY,
      });
      service = module.get<UserService>(UserService);

      const token = signToken('user-1', futureSec(), 'at-secret');
      userRepository.findById.mockResolvedValue(
        buildUser({
          passwordResetTokenHash: `hashed:${token}`,
          passwordResetTokenExpiresAt: new Date(Date.now() + 3_600_000),
        }),
      );

      await expect(
        service.confirmPasswordReset({ token, newPassword: 'N3wS3cret!' }),
      ).resolves.toEqual({ message: 'Mot de passe modifie avec succes' });
    });

    it('should fall back to the default secret when no secret is configured', async () => {
      const module = await buildModule({});
      service = module.get<UserService>(UserService);

      const token = signToken('user-1', futureSec(), 'change-me-pr');
      userRepository.findById.mockResolvedValue(
        buildUser({
          passwordResetTokenHash: `hashed:${token}`,
          passwordResetTokenExpiresAt: new Date(Date.now() + 3_600_000),
        }),
      );

      await expect(
        service.confirmPasswordReset({ token, newPassword: 'N3wS3cret!' }),
      ).resolves.toBeDefined();
    });

    it('should throw BadRequestException when the token does not have 4 segments', async () => {
      await expect(
        service.confirmPasswordReset({
          token: 'user-1.123',
          newPassword: 'N3wS3cret!',
        }),
      ).rejects.toThrow('Token invalide ou expire');
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when a token segment is empty', async () => {
      await expect(
        service.confirmPasswordReset({
          token: 'user-1..raw.sig',
          newPassword: 'N3wS3cret!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when the expiry segment is not a number', async () => {
      await expect(
        service.confirmPasswordReset({
          token: 'user-1.abc.raw.sig',
          newPassword: 'N3wS3cret!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when the HMAC signature does not match', async () => {
      const token = signToken('user-1', futureSec(), 'wrong-secret');

      await expect(
        service.confirmPasswordReset({ token, newPassword: 'N3wS3cret!' }),
      ).rejects.toThrow(BadRequestException);
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the signature length differs', async () => {
      await expect(
        service.confirmPasswordReset({
          token: 'user-1.9999999999.raw.ab',
          newPassword: 'N3wS3cret!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when the expiry encoded in the token is past', async () => {
      const token = signToken('user-1', Math.floor(Date.now() / 1000) - 10);

      await expect(
        service.confirmPasswordReset({ token, newPassword: 'N3wS3cret!' }),
      ).rejects.toThrow(BadRequestException);
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the target user no longer exists', async () => {
      const token = signToken('user-1', futureSec());
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.confirmPasswordReset({ token, newPassword: 'N3wS3cret!' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no reset token is stored', async () => {
      const token = signToken('user-1', futureSec());
      userRepository.findById.mockResolvedValue(buildUser());

      await expect(
        service.confirmPasswordReset({ token, newPassword: 'N3wS3cret!' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when the stored token has expired', async () => {
      const token = signToken('user-1', futureSec());
      userRepository.findById.mockResolvedValue(
        buildUser({
          passwordResetTokenHash: `hashed:${token}`,
          passwordResetTokenExpiresAt: new Date(Date.now() - 1000),
        }),
      );

      await expect(
        service.confirmPasswordReset({ token, newPassword: 'N3wS3cret!' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when the token was already used (hash mismatch)', async () => {
      const token = signToken('user-1', futureSec());
      userRepository.findById.mockResolvedValue(
        buildUser({
          passwordResetTokenHash: 'hashed:another-token',
          passwordResetTokenExpiresAt: new Date(Date.now() + 3_600_000),
        }),
      );
      verifyMock.mockResolvedValue(false);

      await expect(
        service.confirmPasswordReset({ token, newPassword: 'N3wS3cret!' }),
      ).rejects.toThrow(BadRequestException);
      expect(userRepository.updatePassword).not.toHaveBeenCalled();
    });
  });

  // ——— Profil de sante US-05 ———

  describe('updateHealthProfile()', () => {
    it('should encrypt the medical contraindications and report the encrypted fields', async () => {
      userRepository.findById.mockResolvedValue(buildUser());

      const dto = buildHealthProfileDto({
        medicalContraindications: ['asthme', 'allergie aux noix'],
      });
      const result = await service.updateHealthProfile('user-1', dto);

      expect(result).toEqual({
        updated: true,
        fieldsEncrypted: ['medicalContraindications'],
      });

      const [, , encrypted] = userRepository.updateHealthProfile.mock.calls[0];
      expect(encrypted).toHaveLength(2);
      encrypted.forEach((value: string) => {
        // Format attendu : iv_hex(24):authTag_hex(32):ciphertext_hex
        expect(value).toMatch(/^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/);
      });
      expect(encrypted).not.toContain('asthme');
      expect(service.decryptAes256(encrypted[0])).toBe('asthme');
      expect(service.decryptAes256(encrypted[1])).toBe('allergie aux noix');
    });

    it('should produce a different ciphertext for the same plaintext (random IV)', async () => {
      userRepository.findById.mockResolvedValue(buildUser());

      await service.updateHealthProfile(
        'user-1',
        buildHealthProfileDto({ medicalContraindications: ['asthme'] }),
      );
      await service.updateHealthProfile(
        'user-1',
        buildHealthProfileDto({ medicalContraindications: ['asthme'] }),
      );

      const first = userRepository.updateHealthProfile.mock.calls[0][2][0];
      const second = userRepository.updateHealthProfile.mock.calls[1][2][0];
      expect(first).not.toBe(second);
    });

    it('should not encrypt anything when no contraindication is provided', async () => {
      userRepository.findById.mockResolvedValue(buildUser());

      const result = await service.updateHealthProfile(
        'user-1',
        buildHealthProfileDto(),
      );

      expect(result).toEqual({ updated: true, fieldsEncrypted: [] });
      expect(userRepository.updateHealthProfile).toHaveBeenCalledWith(
        'user-1',
        expect.anything(),
        undefined,
      );
    });

    it('should not encrypt anything when the contraindication list is empty', async () => {
      userRepository.findById.mockResolvedValue(buildUser());

      const result = await service.updateHealthProfile(
        'user-1',
        buildHealthProfileDto({ medicalContraindications: [] }),
      );

      expect(result.fieldsEncrypted).toEqual([]);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateHealthProfile('ghost', buildHealthProfileDto()),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.updateHealthProfile).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when the update fails', async () => {
      userRepository.findById.mockResolvedValue(buildUser());
      userRepository.updateHealthProfile.mockResolvedValue(false);

      await expect(
        service.updateHealthProfile('user-1', buildHealthProfileDto()),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should use the fallback AES key when HEALTH_ENCRYPTION_KEY is missing', async () => {
      const module = await buildModule({});
      service = module.get<UserService>(UserService);
      userRepository.findById.mockResolvedValue(buildUser());

      await service.updateHealthProfile(
        'user-1',
        buildHealthProfileDto({ medicalContraindications: ['asthme'] }),
      );

      const encrypted = userRepository.updateHealthProfile.mock.calls[0][2][0];
      expect(service.decryptAes256(encrypted)).toBe('asthme');
    });
  });

  // ——— Preferences de notifications US-14 ———

  describe('updateNotificationPreferences()', () => {
    it('should persist the preferences and echo them back', async () => {
      userRepository.findById.mockResolvedValue(buildUser());
      const dto = buildNotificationPreferencesDto();

      const result = await service.updateNotificationPreferences('user-1', dto);

      expect(userRepository.updateNotificationPreferences).toHaveBeenCalledWith(
        'user-1',
        dto,
      );
      expect(result).toEqual({ updated: true, preferences: dto });
    });

    it('should support a full opt-out on every channel', async () => {
      userRepository.findById.mockResolvedValue(buildUser());
      const dto = {
        email: {
          bookingConfirmation: false,
          reminders: false,
          marketing: false,
        },
        sms: { bookingConfirmation: false, reminders: false },
      } as NotificationPreferencesDto;

      const result = await service.updateNotificationPreferences('user-1', dto);

      expect(result.preferences).toEqual(dto);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateNotificationPreferences(
          'ghost',
          buildNotificationPreferencesDto(),
        ),
      ).rejects.toThrow(NotFoundException);
      expect(
        userRepository.updateNotificationPreferences,
      ).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when the update fails', async () => {
      userRepository.findById.mockResolvedValue(buildUser());
      userRepository.updateNotificationPreferences.mockResolvedValue(false);

      await expect(
        service.updateNotificationPreferences(
          'user-1',
          buildNotificationPreferencesDto(),
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ——— Chiffrement AES-256-GCM US-05 ———

  describe('decryptAes256()', () => {
    const encryptViaService = async (plaintext: string): Promise<string> => {
      userRepository.findById.mockResolvedValue(buildUser());
      await service.updateHealthProfile(
        'user-1',
        buildHealthProfileDto({ medicalContraindications: [plaintext] }),
      );
      const calls = userRepository.updateHealthProfile.mock.calls;
      return calls[calls.length - 1][2][0];
    };

    it('should round-trip an accented plaintext', async () => {
      const encrypted = await encryptViaService('allergie aux fruits a coque');

      expect(service.decryptAes256(encrypted)).toBe(
        'allergie aux fruits a coque',
      );
    });

    it('should throw a dedicated error for the legacy CBC format (iv:ciphertext)', () => {
      expect(() => service.decryptAes256('aabbcc:ddeeff')).toThrow(
        /AES-256-CBC obsolete/,
      );
    });

    it('should throw when the format has neither 2 nor 3 segments', () => {
      expect(() => service.decryptAes256('not-encrypted')).toThrow(
        /format attendu iv:authTag:ciphertext/,
      );
    });

    it('should throw when the IV length is wrong', () => {
      expect(() =>
        service.decryptAes256(`aabb:${'0'.repeat(32)}:ccdd`),
      ).toThrow(InternalServerErrorException);
    });

    it('should throw when the auth tag length is wrong', async () => {
      const encrypted = await encryptViaService('asthme');
      const [iv, , payload] = encrypted.split(':');

      expect(() => service.decryptAes256(`${iv}:aabb:${payload}`)).toThrow(
        InternalServerErrorException,
      );
    });

    it('should reject a tampered ciphertext (GCM authentication)', async () => {
      const encrypted = await encryptViaService('asthme');
      const [iv, tag, payload] = encrypted.split(':');
      const tampered = payload.startsWith('0')
        ? `1${payload.slice(1)}`
        : `0${payload.slice(1)}`;

      expect(() => service.decryptAes256(`${iv}:${tag}:${tampered}`)).toThrow();
    });
  });

  // ——— Export RGPD US-24 ———

  describe('requestRgpdExport()', () => {
    it('should export the profile, the decrypted health data and the bookings', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-08-20T10:00:00Z'));

      // Chiffrer une contre-indication avec la meme cle que le service
      userRepository.findById.mockResolvedValue(buildUser());
      await service.updateHealthProfile(
        'user-1',
        buildHealthProfileDto({ medicalContraindications: ['asthme'] }),
      );
      const cipher = userRepository.updateHealthProfile.mock.calls[0][2][0];

      const user = buildUser({
        healthProfile: {
          weight: 70,
          height: 180,
          medicalContraindications: [cipher],
          emergencyContact: {
            fullName: 'Winston',
            relation: 'butler',
            phone: '+33600000000',
          },
          medicalCertificateFileId: 'file-1',
        },
        notificationPreferences: buildNotificationPreferencesDto(),
      });
      userRepository.findById.mockResolvedValue(user);
      userRepository.getRgpdExportData.mockResolvedValue({
        bookings: [{ bookingId: 'b1' }],
        invoices: [{ invoiceId: 'i1' }],
      });

      const result = await service.requestRgpdExport('user-1');

      expect(result.status).toBe('completed');
      expect(result.requestId).toMatch(/^rgpd-export-user-1-[0-9a-f]{16}$/);
      expect(result.completedAt).toBe('2026-08-20T10:00:00.000Z');
      expect(result.data.profile).toEqual({
        userId: 'user-1',
        email: 'adventurer@example.com',
        firstName: 'Lara',
        lastName: 'Croft',
        birthDate: '1990-01-01T00:00:00.000Z',
        role: 'aventurier',
        status: 'active',
        emailVerified: true,
        acceptCgu: true,
        acceptRgpd: true,
      });
      expect(result.data.healthProfile?.medicalContraindications).toEqual([
        'asthme',
      ]);
      expect(result.data.notificationPreferences).toEqual(
        buildNotificationPreferencesDto(),
      );
      expect(result.data.bookings).toEqual([{ bookingId: 'b1' }]);
      expect(result.data.invoices).toEqual([{ invoiceId: 'i1' }]);
      expect(userRepository.setRgpdExportCompleted).toHaveBeenCalledWith(
        'user-1',
        result.requestId,
        new Date('2026-08-20T10:00:00Z'),
      );
    });

    it('should mark an undecryptable contraindication instead of failing the export', async () => {
      userRepository.findById.mockResolvedValue(
        buildUser({
          healthProfile: {
            medicalContraindications: ['legacy-cbc-iv:legacy-cbc-payload'],
          },
        }),
      );

      const result = await service.requestRgpdExport('user-1');

      expect(result.data.healthProfile?.medicalContraindications).toEqual([
        RGPD_UNDECRYPTABLE_MARKER,
      ]);
    });

    it('should return an undefined health profile when the user has none', async () => {
      userRepository.findById.mockResolvedValue(buildUser());

      const result = await service.requestRgpdExport('user-1');

      expect(result.data.healthProfile).toBeUndefined();
    });

    it('should leave the contraindications undefined when the health profile has none', async () => {
      userRepository.findById.mockResolvedValue(
        buildUser({ healthProfile: { weight: 70 } }),
      );

      const result = await service.requestRgpdExport('user-1');

      expect(result.data.healthProfile).toEqual({
        weight: 70,
        height: undefined,
        medicalContraindications: undefined,
        emergencyContact: undefined,
        medicalCertificateFileId: undefined,
      });
    });

    it('should stringify a birth date that is not a Date instance', async () => {
      userRepository.findById.mockResolvedValue(
        buildUser({ birthDate: '1990-01-01' }),
      );

      const result = await service.requestRgpdExport('user-1');

      expect(result.data.profile.birthDate).toBe('1990-01-01');
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.requestRgpdExport('ghost')).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.getRgpdExportData).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when the request cannot be traced', async () => {
      userRepository.findById.mockResolvedValue(buildUser());
      userRepository.setRgpdExportCompleted.mockResolvedValue(false);

      await expect(service.requestRgpdExport('user-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ——— Suppression RGPD US-24 ———

  describe('requestRgpdDelete()', () => {
    const deleteDto = (overrides: Partial<RgpdDeleteDto> = {}): RgpdDeleteDto =>
      ({ confirmationCode: 'CONFIRM-123', ...overrides }) as RgpdDeleteDto;

    it('should schedule the deletion at J+30 and return the retained data', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-08-20T10:00:00Z'));
      userRepository.findById.mockResolvedValue(buildUser());

      const result = await service.requestRgpdDelete('user-1', deleteDto());

      expect(result.requestId).toMatch(/^rgpd-delete-user-1-[0-9a-f]{16}$/);
      expect(result.scheduledDeletionAt).toBe('2026-09-19T10:00:00.000Z');
      expect(result.retainedData).toEqual(['invoices for legal retention']);
      expect(userRepository.setRgpdDeleteRequest).toHaveBeenCalledWith(
        'user-1',
        result.requestId,
        'CONFIRM-123',
        new Date('2026-08-20T10:30:00Z'),
        new Date('2026-09-19T10:00:00Z'),
      );
    });

    it('should accept a new request when a previous one is completed', async () => {
      userRepository.findById.mockResolvedValue(
        buildUser({
          rgpdRequest: {
            requestId: 'old',
            requestType: 'export',
            status: 'completed',
            requestedAt: new Date(),
          },
        }),
      );

      await expect(
        service.requestRgpdDelete('user-1', deleteDto()),
      ).resolves.toBeDefined();
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.requestRgpdDelete('ghost', deleteDto()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when a deletion is already scheduled', async () => {
      userRepository.findById.mockResolvedValue(
        buildUser({
          rgpdRequest: {
            requestId: 'old',
            requestType: 'delete',
            status: 'scheduled',
            requestedAt: new Date(),
          },
        }),
      );

      await expect(
        service.requestRgpdDelete('user-1', deleteDto()),
      ).rejects.toThrow(ConflictException);
      expect(userRepository.setRgpdDeleteRequest).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the confirmation code is missing', async () => {
      userRepository.findById.mockResolvedValue(buildUser());

      await expect(
        service.requestRgpdDelete(
          'user-1',
          deleteDto({
            confirmationCode: '',
          }),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when the confirmation code is only whitespace', async () => {
      userRepository.findById.mockResolvedValue(buildUser());

      await expect(
        service.requestRgpdDelete(
          'user-1',
          deleteDto({
            confirmationCode: '   ',
          }),
        ),
      ).rejects.toThrow('Code de confirmation invalide');
    });

    it('should throw InternalServerErrorException when the request cannot be saved', async () => {
      userRepository.findById.mockResolvedValue(buildUser());
      userRepository.setRgpdDeleteRequest.mockResolvedValue(false);

      await expect(
        service.requestRgpdDelete('user-1', deleteDto()),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ——— Garde-fou : les exceptions typees restent celles attendues ———

  describe('exception types', () => {
    it('should throw an HttpException with status 423 for a locked account', async () => {
      userRepository.findByEmail.mockResolvedValue(
        buildUser({ lockedUntil: new Date(Date.now() + 60_000) }),
      );

      await expect(
        service.login({
          email: 'adventurer@example.com',
          password: 'x',
        } as LoginDto),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });
});
