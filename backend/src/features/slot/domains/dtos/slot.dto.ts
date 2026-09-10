import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RecurrenceDto {
  @ApiProperty({
    description: 'RFC 5545 RRULE string',
    example: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
  })
  @IsString()
  @IsNotEmpty()
  rrule: string;

  @ApiProperty({
    description: 'ISO 8601 date until which the recurrence applies',
    example: '2026-12-31',
  })
  @IsISO8601()
  untilDate: string;
}

export class CreateSlotsDto {
  @ApiProperty({
    description:
      'Recurrence rule (RRULE iCal). Provide either this or singleStartAt.',
    type: RecurrenceDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurrenceDto)
  recurrence?: RecurrenceDto;

  @ApiProperty({
    description:
      'ISO 8601 date-time for a single slot start. Provide either this or recurrence.',
    example: '2026-06-15T09:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  singleStartAt?: string;

  @ApiProperty({
    description: 'Duration of the slot in minutes',
    example: 60,
  })
  @IsInt()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({
    description: 'Maximum number of participants per slot',
    example: 10,
  })
  @IsInt()
  @Min(1)
  maxParticipants: number;

  @ApiProperty({
    description: 'Price per participant in euros',
    example: 150,
  })
  @IsNumber()
  @Min(0)
  priceEur: number;

  @ApiProperty({
    description: 'List of instructor user IDs',
    example: ['507f1f77bcf86cd799439011'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  instructorIds: string[];
}

export class SlotItemDto {
  @ApiProperty({
    description: 'Slot ID',
    example: '68b4d59919d9b7a94b4fde21',
  })
  id: string;

  @ApiProperty({
    description: 'Slot start date-time (ISO 8601)',
    example: '2026-06-15T09:00:00.000Z',
  })
  startAt: string;
}

export class SlotConflictDto {
  @ApiProperty({
    description: 'Conflicting slot start date-time (ISO 8601)',
    example: '2026-06-22T09:00:00.000Z',
  })
  startAt: string;

  @ApiProperty({
    description: 'Reason for the conflict',
    example: 'Slot already exists at this time',
  })
  reason: string;
}

export class SlotDetailResponseDto {
  @ApiProperty({
    description: 'Slot ID',
    example: '68b4d59919d9b7a94b4fde21',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the activity the slot belongs to',
    example: '68b4d59919d9b7a94b4fde20',
  })
  activityId: string;

  @ApiProperty({
    description: 'Slot start date-time (ISO 8601)',
    example: '2026-09-16T09:00:00.000Z',
  })
  startAt: string;

  @ApiProperty({
    description: 'Duration of the slot in minutes',
    example: 120,
  })
  durationMinutes: number;

  @ApiProperty({
    description: 'Maximum number of participants for this slot',
    example: 8,
  })
  maxParticipants: number;

  @ApiProperty({
    description: 'Remaining available seats (non-cancelled bookings deducted)',
    example: 8,
  })
  remainingSeats: number;

  @ApiProperty({
    description: 'Price per participant in euros',
    example: 149,
  })
  priceEur: number;
}

export class ProSlotListItemDto {
  @ApiProperty({
    description: 'Slot ID',
    example: '68b4d59919d9b7a94b4fde21',
  })
  id: string;

  @ApiProperty({
    description: 'Slot start date-time (ISO 8601)',
    example: '2026-09-16T09:00:00.000Z',
  })
  startAt: string;

  @ApiProperty({
    description: 'Duration of the slot in minutes',
    example: 120,
  })
  durationMinutes: number;

  @ApiProperty({
    description: 'Maximum number of participants for this slot',
    example: 8,
  })
  maxParticipants: number;

  @ApiProperty({
    description: 'Remaining available seats (non-cancelled bookings deducted)',
    example: 6,
  })
  remainingSeats: number;

  @ApiProperty({
    description: 'Price per participant in euros',
    example: 149,
  })
  priceEur: number;
}

export class CreateSlotsResponseDto {
  @ApiProperty({
    description: 'Number of slots successfully created',
    example: 5,
  })
  createdCount: number;

  @ApiProperty({
    description: 'List of created slots',
    type: [SlotItemDto],
  })
  slots: SlotItemDto[];

  @ApiProperty({
    description: 'List of slots that could not be created due to conflicts',
    type: [SlotConflictDto],
  })
  conflicts: SlotConflictDto[];
}
