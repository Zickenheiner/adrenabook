import { ApiProperty } from '@nestjs/swagger';
import { AuditLog } from '../schemas/audit-log.schema';

export class AuditLogEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the audit log entry',
  })
  private readonly id: AuditLog;

  private targetUserId: string;
  private adminId: string;
  private previousStatus: string;
  private newStatus: string;
  private reason: string;
  private durationDays?: number;
  private effectiveUntil?: Date;

  constructor(_id: AuditLog) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): AuditLog {
    return this.id;
  }

  getTargetUserId(): string {
    return this.targetUserId;
  }

  getAdminId(): string {
    return this.adminId;
  }

  getPreviousStatus(): string {
    return this.previousStatus;
  }

  getNewStatus(): string {
    return this.newStatus;
  }

  getReason(): string {
    return this.reason;
  }

  getDurationDays(): number | undefined {
    return this.durationDays;
  }

  getEffectiveUntil(): Date | undefined {
    return this.effectiveUntil;
  }

  // ———————SETTER———————

  setTargetUserId(value: string): void {
    this.targetUserId = value;
  }

  setAdminId(value: string): void {
    this.adminId = value;
  }

  setPreviousStatus(value: string): void {
    this.previousStatus = value;
  }

  setNewStatus(value: string): void {
    this.newStatus = value;
  }

  setReason(value: string): void {
    this.reason = value;
  }

  setDurationDays(value: number | undefined): void {
    this.durationDays = value;
  }

  setEffectiveUntil(value: Date | undefined): void {
    this.effectiveUntil = value;
  }
}
