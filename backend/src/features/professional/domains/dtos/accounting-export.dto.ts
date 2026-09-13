import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum AccountingExportFormat {
  CSV_GENERIC = 'csv_generic',
}

export enum AccountingExportDeliveryMode {
  DOWNLOAD = 'download',
}

export class CreateAccountingExportDto {
  @ApiProperty({
    description: 'Export format',
    enum: AccountingExportFormat,
    example: AccountingExportFormat.CSV_GENERIC,
  })
  @IsEnum(AccountingExportFormat)
  @IsNotEmpty()
  format: AccountingExportFormat;

  @ApiProperty({
    description: 'Start date of the export period (ISO 8601)',
    example: '2026-01-01',
  })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({
    description: 'End date of the export period (ISO 8601)',
    example: '2026-03-31',
  })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description: 'Whether to include refunded transactions',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  includeRefunds: boolean;

  @ApiProperty({
    description: 'How to deliver the export',
    enum: AccountingExportDeliveryMode,
    example: AccountingExportDeliveryMode.DOWNLOAD,
  })
  @IsEnum(AccountingExportDeliveryMode)
  @IsNotEmpty()
  deliveryMode: AccountingExportDeliveryMode;

  @ApiProperty({
    description:
      "Centre sur lequel porte l'export. Facultatif si le professionnel n'en detient qu'un.",
    example: '68b4d59919d9b7a94b4fde21',
    required: false,
  })
  @IsString()
  @IsOptional()
  centerId?: string;
}

export class AccountingExportResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the export job',
    example: '68b4d59919d9b7a94b4fde21',
  })
  exportJobId: string;

  @ApiProperty({
    description: 'Current status of the export',
    enum: ['ready', 'queued'],
    example: 'ready',
  })
  status: 'ready' | 'failed';

  @ApiProperty({
    description: 'Download URL if the export is ready immediately',
    example: 'https://cdn.adrenabook.com/exports/export-2026.csv',
    required: false,
  })
  downloadUrl?: string;

  @ApiProperty({
    description: 'Number of records included in the export',
    example: 42,
  })
  recordsCount: number;
}
