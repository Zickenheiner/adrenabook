import { LoginLogEntity } from '@features/auth/domains/entities/login-log.entity';
import mongoose from 'mongoose';

export interface ILoginLogCreatePayload {
  email: string;
  userId?: mongoose.Types.ObjectId;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}

export interface ILoginLogRepository {
  create(payload: ILoginLogCreatePayload): Promise<LoginLogEntity | null>;
}
