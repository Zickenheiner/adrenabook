import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { LoginLog } from '../schemas/login-log.schema';

export class LoginLogEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the login log',
  })
  private readonly id: LoginLog;

  private email: string;
  private userId?: mongoose.Types.ObjectId;
  private success: boolean;
  private ipAddress?: string;
  private userAgent?: string;
  private reason?: string;

  constructor(_id: LoginLog) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): LoginLog {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getUserId(): mongoose.Types.ObjectId | undefined {
    return this.userId;
  }

  getSuccess(): boolean {
    return this.success;
  }

  getIpAddress(): string | undefined {
    return this.ipAddress;
  }

  getUserAgent(): string | undefined {
    return this.userAgent;
  }

  getReason(): string | undefined {
    return this.reason;
  }

  // ———————SETTER———————

  setEmail(value: string): void {
    this.email = value;
  }

  setUserId(value: mongoose.Types.ObjectId | undefined): void {
    this.userId = value;
  }

  setSuccess(value: boolean): void {
    this.success = value;
  }

  setIpAddress(value: string | undefined): void {
    this.ipAddress = value;
  }

  setUserAgent(value: string | undefined): void {
    this.userAgent = value;
  }

  setReason(value: string | undefined): void {
    this.reason = value;
  }
}
