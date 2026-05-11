import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  Max,
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

export class SearchActivitiesQueryDto {
  @ApiPropertyOptional({
    description: 'Free text search query',
    example: 'parachute',
  })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({
    description: 'Type of activity',
    example: 'climbing',
    enum: [
      'bungee',
      'climbing',
      'diving',
      'paragliding',
      'canyoning',
      'via_ferrata',
    ],
  })
  @IsEnum([
    'bungee',
    'climbing',
    'diving',
    'paragliding',
    'canyoning',
    'via_ferrata',
  ])
  @IsOptional()
  type?:
    | 'bungee'
    | 'climbing'
    | 'diving'
    | 'paragliding'
    | 'canyoning'
    | 'via_ferrata';

  @ApiPropertyOptional({
    description: 'Latitude for geolocation filter',
    example: 48.8566,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({
    description: 'Longitude for geolocation filter',
    example: 2.3522,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  lng?: number;

  @ApiPropertyOptional({
    description: 'Search radius in kilometers (default 50)',
    example: 50,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  radiusKm?: number;

  @ApiPropertyOptional({
    description: 'Start date filter (ISO 8601)',
    example: '2026-06-01',
  })
  @IsString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'End date filter (ISO 8601)',
    example: '2026-06-30',
  })
  @IsString()
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Minimum price in euros',
    example: 50,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum price in euros',
    example: 500,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMax?: number;

  @ApiPropertyOptional({
    description: 'Difficulty level',
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  @IsOptional()
  difficulty?: 'beginner' | 'intermediate' | 'advanced';

  @ApiPropertyOptional({
    description: 'Page number (default 1)',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Page size (default 20, max 50)',
    example: 20,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  pageSize?: number;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'relevance',
    enum: ['relevance', 'price_asc', 'price_desc', 'distance'],
  })
  @IsEnum(['relevance', 'price_asc', 'price_desc', 'distance'])
  @IsOptional()
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'distance';
}

export class SearchActivitiesItemDto {
  @ApiProperty({
    description: 'Activity ID',
    example: '68b4d59919d9b7a94b4fde21',
  })
  id: string;

  @ApiProperty({
    description: 'Activity title',
    example: 'Parachute en tandem',
  })
  title: string;

  @ApiProperty({
    description: 'Activity type',
    example: 'paragliding',
  })
  type: string;

  @ApiProperty({
    description: 'Starting price in euros',
    example: 150,
  })
  priceFromEur: number;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 60,
  })
  durationMinutes: number;

  @ApiProperty({
    description: 'Difficulty level',
    example: 'beginner',
  })
  difficulty: string;

  @ApiProperty({
    description: 'Professional center name',
    example: 'Centre Aventure Alpes',
  })
  centerName: string;

  @ApiPropertyOptional({
    description: 'Distance from search point in kilometers',
    example: 12.5,
  })
  distanceKm?: number;

  @ApiPropertyOptional({
    description: 'Average rating',
    example: 4.7,
  })
  rating?: number;

  @ApiProperty({
    description: 'Cover photo URL',
    example: 'https://cdn.adrenabook.fr/photos/abc123.jpg',
  })
  coverPhotoUrl: string;
}

export class SearchActivitiesResponseDto {
  @ApiProperty({
    description: 'List of activities matching the search criteria',
    type: [SearchActivitiesItemDto],
  })
  items: SearchActivitiesItemDto[];

  @ApiProperty({
    description: 'Total number of results',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of results per page',
    example: 20,
  })
  pageSize: number;
}

export class ActivityDetailPhotoDto {
  @ApiProperty({
    description: 'URL of the photo',
    example: 'https://cdn.adrenabook.fr/photos/abc123.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Alternative text for accessibility',
    example: 'Saut en parachute au-dessus des Alpes',
  })
  alt: string;
}

export class ActivityDetailVideoDto {
  @ApiProperty({
    description: 'URL of the video',
    example: 'https://cdn.adrenabook.fr/videos/def456.mp4',
  })
  url: string;

  @ApiProperty({
    description: 'URL of the video thumbnail',
    example: 'https://cdn.adrenabook.fr/thumbnails/def456.jpg',
  })
  thumbnail: string;
}

export class ActivityDetailCenterLocationDto {
  @ApiProperty({
    description: 'Latitude',
    example: 45.764,
  })
  lat: number;

  @ApiProperty({
    description: 'Longitude',
    example: 4.8357,
  })
  lng: number;

  @ApiProperty({
    description: 'Human-readable address',
    example: '12 Rue de la Montagne, 69001 Lyon, France',
  })
  address: string;
}

export class ActivityDetailCenterDto {
  @ApiProperty({
    description: 'Center ID',
    example: '68b4d59919d9b7a94b4fde21',
  })
  id: string;

  @ApiProperty({
    description: 'Center name',
    example: 'Centre Aventure Alpes',
  })
  name: string;

  @ApiProperty({
    description: 'Center location',
    type: ActivityDetailCenterLocationDto,
  })
  location: ActivityDetailCenterLocationDto;
}

export class ActivityDetailUpcomingSlotDto {
  @ApiProperty({
    description: 'Slot ID',
    example: '68b4d59919d9b7a94b4fde22',
  })
  id: string;

  @ApiProperty({
    description: 'Slot start date/time (ISO 8601)',
    example: '2026-06-15T09:00:00.000Z',
  })
  startAt: string;

  @ApiProperty({
    description: 'Remaining available seats',
    example: 5,
  })
  remainingSeats: number;

  @ApiProperty({
    description: 'Price for this slot in euros',
    example: 150,
  })
  priceEur: number;
}

export class ActivityDetailReviewsSummaryDto {
  @ApiProperty({
    description: 'Total number of verified reviews',
    example: 42,
  })
  count: number;

  @ApiProperty({
    description: 'Average rating (0–5)',
    example: 4.7,
  })
  averageRating: number;
}

export class ActivityDetailResponseDto {
  @ApiProperty({
    description: 'Activity ID',
    example: '68b4d59919d9b7a94b4fde21',
  })
  id: string;

  @ApiProperty({
    description: 'Activity title',
    example: 'Parachute en tandem',
  })
  title: string;

  @ApiProperty({
    description: 'Activity description',
    example: 'Saut en parachute en tandem avec un instructeur certifié',
  })
  description: string;

  @ApiProperty({
    description: 'Activity type',
    example: 'parachute',
  })
  type: string;

  @ApiProperty({
    description: 'Difficulty level',
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  difficulty: string;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 60,
  })
  durationMinutes: number;

  @ApiProperty({
    description: 'Starting price in euros',
    example: 150,
  })
  priceFromEur: number;

  @ApiProperty({
    description: 'Prerequisites for the activity',
  })
  prerequisites: {
    minAge: number;
    maxAge?: number;
    minWeightKg?: number;
    maxWeightKg?: number;
    medicalCertificateRequired: boolean;
  };

  @ApiProperty({
    description: 'List of included equipment',
    type: [String],
    example: ['combinaison', 'casque'],
  })
  includedEquipment: string[];

  @ApiProperty({
    description: 'Photos of the activity',
    type: [ActivityDetailPhotoDto],
  })
  photos: ActivityDetailPhotoDto[];

  @ApiProperty({
    description: 'Videos of the activity',
    type: [ActivityDetailVideoDto],
  })
  videos: ActivityDetailVideoDto[];

  @ApiProperty({
    description: 'Center information',
    type: ActivityDetailCenterDto,
  })
  center: ActivityDetailCenterDto;

  @ApiProperty({
    description: 'Upcoming available slots within the next 90 days',
    type: [ActivityDetailUpcomingSlotDto],
  })
  upcomingSlots: ActivityDetailUpcomingSlotDto[];

  @ApiProperty({
    description: 'Reviews summary',
    type: ActivityDetailReviewsSummaryDto,
  })
  reviewsSummary: ActivityDetailReviewsSummaryDto;
}
