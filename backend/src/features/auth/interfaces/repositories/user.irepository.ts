import {
  CreateUserDto,
  HealthProfileDto,
  NotificationPreferencesDto,
  RegisterDto,
  UpdateUserDto,
} from '@features/auth/domains/dtos/user.dto';
import { UserEntity } from '@features/auth/domains/entities/user.entity';

export interface IUserRepository {
  findAll(): Promise<UserEntity[] | null>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  register(
    dto: RegisterDto,
    hashedPassword: string,
    emailVerificationToken: string,
  ): Promise<UserEntity | null>;
  create(dto: CreateUserDto): Promise<boolean>;
  update(id: string, dto: UpdateUserDto): Promise<boolean>;
  delete(id: string): Promise<boolean>;

  // ——— Securite US-02 ———
  incrementFailedAttempts(id: string): Promise<UserEntity | null>;
  lockAccount(id: string, lockedUntil: Date): Promise<boolean>;
  resetFailedAttempts(id: string): Promise<boolean>;
  setTwoFactorCode(id: string, code: string, expiresAt: Date): Promise<boolean>;
  clearTwoFactorCode(id: string): Promise<boolean>;
  setRefreshTokenHash(id: string, hash: string): Promise<boolean>;

  // ——— Reinitialisation mot de passe US-03 ———
  setPasswordResetToken(
    id: string,
    hashedToken: string,
    expiresAt: Date,
  ): Promise<boolean>;
  clearPasswordResetToken(id: string): Promise<boolean>;
  updatePassword(id: string, hashedPassword: string): Promise<boolean>;
  clearRefreshTokenHash(id: string): Promise<boolean>;

  // ——— Profil de sante US-05 ———
  updateHealthProfile(
    id: string,
    dto: HealthProfileDto,
    encryptedContraindications: string[] | undefined,
  ): Promise<boolean>;

  // ——— Preferences de notifications US-14 ———
  updateNotificationPreferences(
    id: string,
    dto: NotificationPreferencesDto,
  ): Promise<boolean>;

  // ——— Statut admin US-22 ———
  updateStatus(id: string, status: string): Promise<boolean>;
}
