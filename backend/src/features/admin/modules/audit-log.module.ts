import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditLog,
  AuditLogSchema,
} from '@features/admin/domains/schemas/audit-log.schema';
import { User, UserSchema } from '@features/auth/domains/schemas/user.schema';
import { AdminUserStatusController } from './controllers/audit-log.controller';
import { AdminUserStatusService } from './implementation/services/admin-user-status.service';
import { AuditLogService } from './implementation/services/audit-log.service';
import { AuditLogRepository } from './implementation/repositories/audit-log.repository';
import { AuditLogMapper } from './implementation/mappers/audit-log.mapper';
import { UserBaseModule } from '@features/auth/modules/user.module';
import { UserRepository } from '@features/auth/modules/implementation/repositories/user.repository';
import { UserMapper } from '@features/auth/modules/implementation/mappers/user.mapper';
import {
  LoginLog,
  LoginLogSchema,
} from '@features/auth/domains/schemas/login-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: User.name, schema: UserSchema },
      { name: LoginLog.name, schema: LoginLogSchema },
    ]),
    UserBaseModule,
  ],
  controllers: [AdminUserStatusController],
  providers: [
    AuditLogMapper,
    UserMapper,
    {
      provide: 'IAuditLogService',
      useClass: AuditLogService,
    },
    {
      provide: 'IAuditLogRepository',
      useClass: AuditLogRepository,
    },
    {
      provide: 'IAdminUserStatusService',
      useClass: AdminUserStatusService,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: ['IAuditLogService', 'IAdminUserStatusService'],
})
export class AuditLogBaseModule {}
