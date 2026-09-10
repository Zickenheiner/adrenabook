import { Module } from '@nestjs/common';
import { AdminBaseModule } from './modules/center-review.module';
import { AuditLogBaseModule } from './modules/audit-log.module';

@Module({
  imports: [AdminBaseModule, AuditLogBaseModule],
  exports: [AdminBaseModule, AuditLogBaseModule],
})
export class AdminModule {}
