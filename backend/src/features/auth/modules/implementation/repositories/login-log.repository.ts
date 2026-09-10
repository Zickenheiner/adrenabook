import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ILoginLogCreatePayload,
  ILoginLogRepository,
} from '../../../interfaces/repositories/login-log.irepository';
import {
  LoginLog,
  LoginLogDocument,
} from '@features/auth/domains/schemas/login-log.schema';
import { LoginLogEntity } from '@features/auth/domains/entities/login-log.entity';
import { LoginLogMapper } from '../mappers/login-log.mapper';

@Injectable()
export class LoginLogRepository implements ILoginLogRepository {
  constructor(
    @InjectModel(LoginLog.name)
    private readonly loginLogModel: Model<LoginLogDocument>,
    private readonly loginLogMapper: LoginLogMapper,
  ) {}

  async create(
    payload: ILoginLogCreatePayload,
  ): Promise<LoginLogEntity | null> {
    const document = new this.loginLogModel({
      email: payload.email,
      userId: payload.userId,
      success: payload.success,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
      reason: payload.reason,
    });
    const created = await document.save();
    return created ? this.loginLogMapper.toEntity(created) : null;
  }
}
