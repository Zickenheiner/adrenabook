import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditLog,
  AuditLogSchema,
} from '@features/admin/domains/schemas/audit-log.schema';
import {
  SensitiveActionLog,
  SensitiveActionLogSchema,
} from '@features/admin/domains/schemas/sensitive-action-log.schema';
import { User, UserSchema } from '@features/auth/domains/schemas/user.schema';
import { AdminUserStatusController } from './controllers/audit-log.controller';
import { SensitiveActionLogController } from './controllers/sensitive-action-log.controller';
import { AdminUserStatusService } from './implementation/services/admin-user-status.service';
import { AuditLogService } from './implementation/services/audit-log.service';
import { SensitiveActionLogService } from './implementation/services/sensitive-action-log.service';
import { AuditLogRepository } from './implementation/repositories/audit-log.repository';
import { SensitiveActionLogRepository } from './implementation/repositories/sensitive-action-log.repository';
import { AuditLogMapper } from './implementation/mappers/audit-log.mapper';
import { SensitiveActionLogMapper } from './implementation/mappers/sensitive-action-log.mapper';
import { UserBaseModule } from '@features/auth/modules/user.module';
import { UserRepository } from '@features/auth/modules/implementation/repositories/user.repository';
import { UserMapper } from '@features/auth/modules/implementation/mappers/user.mapper';
import {
  LoginLog,
  LoginLogSchema,
} from '@features/auth/domains/schemas/login-log.schema';
import {
  Booking,
  BookingSchema,
} from '@features/booking/domains/schemas/booking.schema';
import {
  Activity,
  ActivitySchema,
} from '@features/activity/domains/schemas/activity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: SensitiveActionLog.name, schema: SensitiveActionLogSchema },
      { name: User.name, schema: UserSchema },
      { name: LoginLog.name, schema: LoginLogSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Activity.name, schema: ActivitySchema },
    ]),
    UserBaseModule,
  ],
  controllers: [AdminUserStatusController, SensitiveActionLogController],
  providers: [
    AuditLogMapper,
    SensitiveActionLogMapper,
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
    {
      provide: 'ISensitiveActionLogService',
      useClass: SensitiveActionLogService,
    },
    {
      provide: 'ISensitiveActionLogRepository',
      useClass: SensitiveActionLogRepository,
    },
  ],
  exports: [
    'IAuditLogService',
    'IAdminUserStatusService',
    'ISensitiveActionLogService',
  ],
})
export class AuditLogBaseModule {}
