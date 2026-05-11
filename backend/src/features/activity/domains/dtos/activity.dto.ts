import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PrerequisitesDto {
  @ApiProperty({
    description: 'Minimum age required',
    example: 18,
  })
  @IsNumber()
  @Min(0)
  minAge: number;

  @ApiProperty({
    description: 'Maximum age allowed',
    example: 70,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxAge?: number;

  @ApiProperty({
    description: 'Minimum weight in kg',
    example: 40,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minWeightKg?: number;

  @ApiProperty({
    description: 'Maximum weight in kg',
    example: 120,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxWeightKg?: number;

  @ApiProperty({
    description: 'Whether a medical certificate is required',
    example: false,
  })
  @IsBoolean()
  medicalCertificateRequired: boolean;
}

export class CreateActivityDto {
  @ApiProperty({
    description: 'Title of the activity',
    example: 'Parachute en tandem',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description of the activity',
    example: 'Saut en parachute en tandem avec un instructeur certifié',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Type of activity',
    example: 'parachute',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Difficulty level',
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  @ApiProperty({
    description: 'Duration in minutes',
    example: 60,
  })
  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({
    description: 'Starting price in euros',
    example: 150,
  })
  @IsNumber()
  @Min(0)
  priceFromEur: number;

  @ApiProperty({
    description: 'Prerequisites for the activity',
    type: PrerequisitesDto,
  })
  @ValidateNested()
  @Type(() => PrerequisitesDto)
  prerequisites: PrerequisitesDto;

  @ApiProperty({
    description: 'List of included equipment',
    example: ['combinaison', 'casque'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  includedEquipment: string[];

  @ApiProperty({
    description: 'List of uploaded photo file IDs',
    example: ['file_abc123', 'file_def456'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  photoFileIds: string[];

  @ApiProperty({
    description: 'Publication status',
    example: 'draft',
    enum: ['draft', 'published'],
  })
  @IsEnum(['draft', 'published'])
  status: 'draft' | 'published';
}

export class UpdateActivityDto {
  @ApiProperty({
    description: 'Title of the activity',
    example: 'Parachute en tandem',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Description of the activity',
    example: 'Saut en parachute en tandem avec un instructeur certifié',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Type of activity',
    example: 'parachute',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: 'Difficulty level',
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced'],
    required: false,
  })
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  @IsOptional()
  difficulty?: 'beginner' | 'intermediate' | 'advanced';

  @ApiProperty({
    description: 'Duration in minutes',
    example: 60,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({
    description: 'Starting price in euros',
    example: 150,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceFromEur?: number;

  @ApiProperty({
    description: 'Prerequisites for the activity',
    type: PrerequisitesDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => PrerequisitesDto)
  @IsOptional()
  prerequisites?: PrerequisitesDto;

  @ApiProperty({
    description: 'List of included equipment',
    example: ['combinaison', 'casque'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includedEquipment?: string[];

  @ApiProperty({
    description: 'List of uploaded photo file IDs',
    example: ['file_abc123', 'file_def456'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photoFileIds?: string[];

  @ApiProperty({
    description: 'Publication status',
    example: 'draft',
    enum: ['draft', 'published'],
    required: false,
  })
  @IsEnum(['draft', 'published'])
  @IsOptional()
  status?: 'draft' | 'published';
}

export class ActivityResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the activity',
    example: '68b4d59919d9b7a94b4fde21',
  })
  id: string;

  @ApiProperty({
    description: 'Publication status',
    example: 'draft',
    enum: ['draft', 'pending_admin_review', 'published', 'archived'],
  })
  status: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2026-05-11T07:34:37.434Z',
  })
  createdAt: string;
}
