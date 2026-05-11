import {
  CreateUserDto,
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
}
