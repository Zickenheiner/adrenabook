import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';
import { UserService } from './implementation/services/user.service';
import { UserRepository } from './implementation/repositories/user.repository';
import { UserMapper } from './implementation/mappers/user.mapper';
import { LoginLogRepository } from './implementation/repositories/login-log.repository';
import { LoginLogMapper } from './implementation/mappers/login-log.mapper';
import { User, UserSchema } from '@features/auth/domains/schemas/user.schema';
import {
  LoginLog,
  LoginLogSchema,
} from '@features/auth/domains/schemas/login-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: LoginLog.name, schema: LoginLogSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [UserController, AuthController],
  providers: [
    UserMapper,
    LoginLogMapper,
    {
      provide: 'IUserService',
      useClass: UserService,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'ILoginLogRepository',
      useClass: LoginLogRepository,
    },
  ],
  exports: ['IUserService'],
})
export class UserBaseModule {}
