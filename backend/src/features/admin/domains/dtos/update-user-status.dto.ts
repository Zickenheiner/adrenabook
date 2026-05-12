import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'New status to apply to the user',
    enum: ['active', 'suspended', 'banned'],
    example: 'suspended',
  })
  @IsEnum(['active', 'suspended', 'banned'])
  status: 'active' | 'suspended' | 'banned';

  @ApiProperty({
    description: 'Mandatory justification for the status change',
    example: 'Multiple violations of terms of service',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description: 'Duration in days for a temporary suspension',
    example: 7,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;
}

export class UpdateUserStatusResponseDto {
  @ApiProperty({
    description: 'ID of the updated user',
    example: '68b4d59919d9b7a94b4fde21',
  })
  userId: string;

  @ApiProperty({
    description: 'Status before the update',
    example: 'active',
  })
  previousStatus: string;

  @ApiProperty({
    description: 'Status after the update',
    example: 'suspended',
  })
  newStatus: string;

  @ApiProperty({
    description:
      'ISO date until which the status is effective (for suspensions)',
    example: '2026-05-19T00:00:00.000Z',
    required: false,
  })
  effectiveUntil?: string;

  @ApiProperty({
    description: 'ID of the audit log entry created for this action',
    example: '68b4d59919d9b7a94b4fde99',
  })
  auditLogId: string;
}
