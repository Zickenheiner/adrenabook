import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAuditLogDto {
  @ApiProperty({
    description: 'The ID of the user whose status is being changed',
    example: '68b4d59919d9b7a94b4fde21',
  })
  @IsString()
  @IsNotEmpty()
  targetUserId: string;

  @ApiProperty({
    description: 'The ID of the admin performing the action',
    example: '68b4d59919d9b7a94b4fde22',
  })
  @IsString()
  @IsNotEmpty()
  adminId: string;

  @ApiProperty({
    description: 'Previous status of the user',
    enum: ['active', 'suspended', 'banned'],
    example: 'active',
  })
  @IsEnum(['active', 'suspended', 'banned'])
  previousStatus: string;

  @ApiProperty({
    description: 'New status of the user',
    enum: ['active', 'suspended', 'banned'],
    example: 'suspended',
  })
  @IsEnum(['active', 'suspended', 'banned'])
  newStatus: string;

  @ApiProperty({
    description: 'Reason for the status change (mandatory justification)',
    example: 'Multiple violations of terms of service',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description: 'Duration in days for temporary suspension',
    example: 7,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @ApiProperty({
    description: 'Effective until date for temporary suspension',
    example: '2026-05-19T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  effectiveUntil?: Date;
}

export class UpdateAuditLogDto {
  @ApiProperty({
    description: 'The reason for the audit log update',
    example: 'Updated reason',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
