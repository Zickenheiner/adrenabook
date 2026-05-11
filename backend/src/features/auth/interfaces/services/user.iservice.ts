import {
  CreateUserDto,
  HealthProfileDto,
  HealthProfileResponseDto,
  LoginDto,
  LoginResponseDto,
  NotificationPreferencesDto,
  NotificationPreferencesResponseDto,
  PasswordResetConfirmDto,
  PasswordResetConfirmResponseDto,
  PasswordResetRequestDto,
  PasswordResetRequestResponseDto,
  RegisterDto,
  RegisterResponseDto,
  UpdateUserDto,
} from '@features/auth/domains/dtos/user.dto';
import { UserEntity } from '@features/auth/domains/entities/user.entity';

export interface ILoginContext {
  ipAddress?: string;
  userAgent?: string;
}

export interface IUserService {
  findAll(): Promise<UserEntity[] | null>;
  findById(id: string): Promise<UserEntity | null>;
  register(dto: RegisterDto): Promise<RegisterResponseDto>;
  login(dto: LoginDto, context?: ILoginContext): Promise<LoginResponseDto>;
  requestPasswordReset(
    dto: PasswordResetRequestDto,
  ): Promise<PasswordResetRequestResponseDto>;
  confirmPasswordReset(
    dto: PasswordResetConfirmDto,
  ): Promise<PasswordResetConfirmResponseDto>;
  create(dto: CreateUserDto): Promise<boolean>;
  update(id: string, dto: UpdateUserDto): Promise<boolean>;
  delete(id: string): Promise<boolean>;

  // ——— Profil de sante US-05 ———
  updateHealthProfile(
    userId: string,
    dto: HealthProfileDto,
  ): Promise<HealthProfileResponseDto>;

  // ——— Preferences de notifications US-14 ———
  updateNotificationPreferences(
    userId: string,
    dto: NotificationPreferencesDto,
  ): Promise<NotificationPreferencesResponseDto>;
}
