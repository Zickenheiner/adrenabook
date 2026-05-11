import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ReviewCenterDto {
  @ApiProperty({
    description: 'Decision taken on the center KYC dossier',
    example: 'approve',
    enum: ['approve', 'reject', 'request_more_info'],
  })
  @IsEnum(['approve', 'reject', 'request_more_info'])
  decision: 'approve' | 'reject' | 'request_more_info';

  @ApiProperty({
    description: 'Internal comment visible only to admins',
    example: 'Documents look valid, approving.',
    required: false,
  })
  @IsOptional()
  @IsString()
  internalComment?: string;

  @ApiProperty({
    description: 'Reason for rejection (required when decision is reject)',
    example: 'incomplete_kbis',
    enum: ['incomplete_kbis', 'invalid_diploma', 'expired_insurance', 'other'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['incomplete_kbis', 'invalid_diploma', 'expired_insurance', 'other'])
  rejectionReason?:
    | 'incomplete_kbis'
    | 'invalid_diploma'
    | 'expired_insurance'
    | 'other';

  @ApiProperty({
    description: 'Public comment sent to the applicant',
    example: 'Your KBIS document is missing. Please resubmit.',
    required: false,
  })
  @IsOptional()
  @IsString()
  publicComment?: string;
}

export class ReviewCenterResponseDto {
  @ApiProperty({
    description: 'The ID of the reviewed center',
    example: '68b4d59919d9b7a94b4fde21',
  })
  centerId: string;

  @ApiProperty({
    description: 'New status of the center after review',
    example: 'approved',
    enum: ['approved', 'rejected', 'awaiting_info'],
  })
  newStatus: 'approved' | 'rejected' | 'awaiting_info';

  @ApiProperty({
    description: 'ISO datetime of when the review was performed',
    example: '2026-05-11T10:00:00.000Z',
  })
  reviewedAt: string;

  @ApiProperty({
    description: 'ID of the admin who performed the review',
    example: '68b4d59919d9b7a94b4fde22',
  })
  reviewedBy: string;

  @ApiProperty({
    description: 'Whether an email notification was sent to the applicant',
    example: true,
  })
  notificationSent: boolean;
}
