import {
  CreateUserDto,
  LoginDto,
  LoginResponseDto,
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
  create(dto: CreateUserDto): Promise<boolean>;
  update(id: string, dto: UpdateUserDto): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
