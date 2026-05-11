import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';
import { UserService } from './implementation/services/user.service';
import { UserRepository } from './implementation/repositories/user.repository';
import { UserMapper } from './implementation/mappers/user.mapper';
import { User, UserSchema } from '@features/auth/domains/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController, AuthController],
  providers: [
    UserMapper,
    {
      provide: 'IUserService',
      useClass: UserService,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: ['IUserService'],
})
export class UserBaseModule {}
