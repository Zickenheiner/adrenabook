import { ApiProperty } from '@nestjs/swagger';
import {
  ActionType,
  SensitiveActionLog,
  SeverityLevel,
} from '../schemas/sensitive-action-log.schema';

export class SensitiveActionLogEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the sensitive action log entry',
  })
  private readonly id: SensitiveActionLog;

  private actorId: string;
  private actorRole: string;
  private actionType: ActionType;
  private targetType: string;
  private targetId: string;
  private severity: SeverityLevel;
  private ipAddress?: string;
  private userAgent?: string;
  private metadata?: Record<string, unknown>;
  private integrityHash: string;
  private timestamp: Date;

  constructor(_id: SensitiveActionLog) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): SensitiveActionLog {
    return this.id;
  }

  getActorId(): string {
    return this.actorId;
  }

  getActorRole(): string {
    return this.actorRole;
  }

  getActionType(): ActionType {
    return this.actionType;
  }

  getTargetType(): string {
    return this.targetType;
  }

  getTargetId(): string {
    return this.targetId;
  }

  getSeverity(): SeverityLevel {
    return this.severity;
  }

  getIpAddress(): string | undefined {
    return this.ipAddress;
  }

  getUserAgent(): string | undefined {
    return this.userAgent;
  }

  getMetadata(): Record<string, unknown> | undefined {
    return this.metadata;
  }

  getIntegrityHash(): string {
    return this.integrityHash;
  }

  getTimestamp(): Date {
    return this.timestamp;
  }

  // ———————SETTER———————

  setActorId(value: string): void {
    this.actorId = value;
  }

  setActorRole(value: string): void {
    this.actorRole = value;
  }

  setActionType(value: ActionType): void {
    this.actionType = value;
  }

  setTargetType(value: string): void {
    this.targetType = value;
  }

  setTargetId(value: string): void {
    this.targetId = value;
  }

  setSeverity(value: SeverityLevel): void {
    this.severity = value;
  }

  setIpAddress(value: string | undefined): void {
    this.ipAddress = value;
  }

  setUserAgent(value: string | undefined): void {
    this.userAgent = value;
  }

  setMetadata(value: Record<string, unknown> | undefined): void {
    this.metadata = value;
  }

  setIntegrityHash(value: string): void {
    this.integrityHash = value;
  }

  setTimestamp(value: Date): void {
    this.timestamp = value;
  }
}
