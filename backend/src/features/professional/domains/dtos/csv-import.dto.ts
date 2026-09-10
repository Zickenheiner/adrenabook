import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsObject,
} from 'class-validator';

export class CsvImportDto {
  @ApiProperty({
    description: 'Type of entity to import',
    example: 'slots',
    enum: ['slots', 'customers', 'activities'],
  })
  @IsEnum(['slots', 'customers', 'activities'])
  @IsNotEmpty()
  entityType: 'slots' | 'customers' | 'activities';

  @ApiProperty({
    description: 'ID of the previously uploaded file',
    example: 'file_abc123',
  })
  @IsString()
  @IsNotEmpty()
  fileId: string;

  @ApiProperty({
    description: 'Mapping of CSV column names to target field names',
    example: { date: 'startDate', title: 'name' },
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @IsObject()
  columnMapping: Record<string, string>;

  @ApiProperty({
    description: 'If true, runs the import in dry-run mode (no data saved)',
    example: false,
  })
  @IsBoolean()
  dryRun: boolean;
}

export class CsvImportErrorDto {
  @ApiProperty({ description: 'Line number of the error', example: 3 })
  line: number;

  @ApiProperty({
    description: 'Column name where the error occurred',
    example: 'startDate',
  })
  column: string;

  @ApiProperty({
    description: 'Description of the error',
    example: 'Invalid date format',
  })
  reason: string;
}

export class CsvImportResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the import job',
    example: '68b4d59919d9b7a94b4fde21',
  })
  importJobId: string;

  @ApiProperty({
    description: 'Current status of the import job',
    example: 'queued',
    enum: ['queued', 'processing', 'completed', 'failed'],
  })
  status: 'queued' | 'processing' | 'completed' | 'failed';

  @ApiProperty({ description: 'Total number of rows in the CSV', example: 100 })
  rowsTotal: number;

  @ApiProperty({
    description: 'Number of successfully imported rows',
    example: 95,
  })
  rowsSuccess: number;

  @ApiProperty({ description: 'Number of rows with errors', example: 5 })
  rowsErrors: number;

  @ApiProperty({
    description: 'List of errors per line',
    type: [CsvImportErrorDto],
  })
  errors: CsvImportErrorDto[];
}
