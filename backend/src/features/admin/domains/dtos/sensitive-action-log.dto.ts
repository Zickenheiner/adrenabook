import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export type ActionTypeEnum =
  | 'auth.login'
  | 'auth.login_failed'
  | 'user.status_changed'
  | 'center.reviewed'
  | 'data.deleted'
  | 'payment.refunded';

export type SeverityEnum = 'info' | 'warning' | 'critical';

const ACTION_TYPES: ActionTypeEnum[] = [
  'auth.login',
  'auth.login_failed',
  'user.status_changed',
  'center.reviewed',
  'data.deleted',
  'payment.refunded',
];

const SEVERITY_LEVELS: SeverityEnum[] = ['info', 'warning', 'critical'];

export class AuditLogsQueryDto {
  @ApiProperty({
    description: 'Filter by actor (user) ID',
    example: '68b4d59919d9b7a94b4fde21',
    required: false,
  })
  @IsOptional()
  @IsString()
  actorId?: string;

  @ApiProperty({
    description: 'Filter by action type',
    enum: ACTION_TYPES,
    required: false,
  })
  @IsOptional()
  @IsEnum(ACTION_TYPES)
  actionType?: ActionTypeEnum;

  @ApiProperty({
    description: 'Start date filter (ISO 8601)',
    example: '2026-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiProperty({
    description: 'End date filter (ISO 8601)',
    example: '2026-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  to?: string;

  @ApiProperty({
    description: 'Filter by severity level',
    enum: SEVERITY_LEVELS,
    required: false,
  })
  @IsOptional()
  @IsEnum(SEVERITY_LEVELS)
  severity?: SeverityEnum;

  @ApiProperty({
    description: 'Page number (1-based)',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export class AuditLogItemDto {
  @ApiProperty({ example: '68b4d59919d9b7a94b4fde21' })
  id: string;

  @ApiProperty({ example: '2026-05-12T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '68b4d59919d9b7a94b4fde22' })
  actorId: string;

  @ApiProperty({ example: 'Admin' })
  actorRole: string;

  @ApiProperty({ example: 'user.status_changed' })
  actionType: string;

  @ApiProperty({ example: 'User' })
  targetType: string;

  @ApiProperty({ example: '68b4d59919d9b7a94b4fde23' })
  targetId: string;

  @ApiProperty({ example: 'warning', enum: SEVERITY_LEVELS })
  severity: string;

  @ApiProperty({ example: '192.168.1.1', required: false })
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0 ...', required: false })
  userAgent: string;

  @ApiProperty({ example: {}, type: 'object', additionalProperties: true })
  metadata: Record<string, unknown>;

  @ApiProperty({ example: 'sha256:abc123...' })
  integrityHash: string;
}

export class AuditLogsResponseDto {
  @ApiProperty({ type: [AuditLogItemDto] })
  items: AuditLogItemDto[];

  @ApiProperty({ example: 42, description: 'Total number of matching logs' })
  total: number;
}

export class CreateSensitiveActionLogDto {
  @ApiProperty({ example: '68b4d59919d9b7a94b4fde21' })
  @IsString()
  actorId: string;

  @ApiProperty({ example: 'Admin' })
  @IsString()
  actorRole: string;

  @ApiProperty({ enum: ACTION_TYPES, example: 'user.status_changed' })
  @IsEnum(ACTION_TYPES)
  actionType: ActionTypeEnum;

  @ApiProperty({ example: 'User' })
  @IsString()
  targetType: string;

  @ApiProperty({ example: '68b4d59919d9b7a94b4fde23' })
  @IsString()
  targetId: string;

  @ApiProperty({ enum: SEVERITY_LEVELS, example: 'warning', required: false })
  @IsOptional()
  @IsEnum(SEVERITY_LEVELS)
  severity?: SeverityEnum;

  @ApiProperty({ example: '192.168.1.1', required: false })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ example: 'Mozilla/5.0 ...', required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
