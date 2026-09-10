import { Injectable } from '@nestjs/common';
import { LoginLogEntity } from '@features/auth/domains/entities/login-log.entity';
import { LoginLogDocument } from '@features/auth/domains/schemas/login-log.schema';

@Injectable()
export class LoginLogMapper {
  toEntity(doc: LoginLogDocument): LoginLogEntity {
    const entity = new LoginLogEntity(doc._id);
    entity.setEmail(doc.email);
    entity.setUserId(doc.userId);
    entity.setSuccess(doc.success);
    entity.setIpAddress(doc.ipAddress);
    entity.setUserAgent(doc.userAgent);
    entity.setReason(doc.reason);
    return entity;
  }
}
