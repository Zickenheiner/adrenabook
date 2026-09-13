import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CentersMapQueryDto {
  @ApiProperty({
    description: "Bounding box in format 'minLng,minLat,maxLng,maxLat'",
    example: '2.2,48.8,2.4,48.9',
  })
  @IsString()
  @IsNotEmpty()
  bbox: string;

  @ApiProperty({
    description: 'Filter by activity type',
    example: 'escalade',
    required: false,
  })
  @IsString()
  @IsOptional()
  activityType?: string;

  @ApiProperty({
    description: 'Current map zoom level to adapt precision and clustering',
    example: 10,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  zoom: number;
}

export class CenterMapItemDto {
  @ApiProperty({ example: '68b4d59919d9b7a94b4fde21' })
  id: string;

  @ApiProperty({ example: 'Centre Outdoor Lyon' })
  name: string;

  @ApiProperty({ example: 45.764 })
  lat: number;

  @ApiProperty({ example: 4.8357 })
  lng: number;

  @ApiProperty({ example: 3 })
  activitiesCount: number;

  @ApiProperty({ example: false, required: false })
  cluster?: boolean;

  @ApiProperty({ example: 5, required: false })
  clusterSize?: number;
}

export class CentersMapResponseDto {
  @ApiProperty({ type: [CenterMapItemDto] })
  centers: CenterMapItemDto[];
}

export class CentersQueryDto {
  @ApiProperty({
    description: 'Latitude of the search origin',
    example: 45.764,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @ApiProperty({
    description: 'Longitude of the search origin',
    example: 4.8357,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lng?: number;

  @ApiProperty({
    description: 'Search radius in kilometers',
    example: 50,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  radius?: number;

  @ApiProperty({
    description: 'Filter by activity type',
    example: 'escalade',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;
}

export class CenterListItemDto {
  @ApiProperty({ example: '68b4d59919d9b7a94b4fde21' })
  id: string;

  @ApiProperty({ example: 'Centre Outdoor Lyon' })
  name: string;

  @ApiProperty({ example: 45.764 })
  lat: number;

  @ApiProperty({ example: 4.8357 })
  lng: number;

  @ApiProperty({ example: 'Lyon' })
  city: string;

  @ApiProperty({ example: 5 })
  activitiesCount: number;
}

export class CentersListResponseDto {
  @ApiProperty({ type: [CenterListItemDto] })
  centers: CenterListItemDto[];
}

export class CenterActivityItemDto {
  @ApiProperty({ example: '68b4d59919d9b7a94b4fde30' })
  id: string;

  @ApiProperty({ example: 'Via ferrata du Vercors' })
  title: string;

  @ApiProperty({ example: 'climbing' })
  type: string;

  @ApiProperty({ example: 'beginner' })
  difficulty: string;

  @ApiProperty({ example: 120 })
  durationMinutes: number;

  @ApiProperty({ example: 45 })
  priceEur: number;

  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde99',
    description:
      "Identifiant de l'image de couverture, a resoudre via GET /activities/photos/:fileId. Vide si l'activite n'en a pas.",
  })
  coverPhotoUrl: string;
}

/**
 * Fiche publique d'un centre : son identite et les activites publiees qu'il
 * propose. Les donnees sensibles du dossier (SIRET, representant legal,
 * justificatifs) n'y figurent pas.
 */
export class CenterDetailResponseDto {
  @ApiProperty({ example: '68b4d59919d9b7a94b4fde21' })
  id: string;

  @ApiProperty({ example: 'Centre Outdoor Lyon' })
  name: string;

  @ApiProperty({ example: 'Lyon' })
  city: string;

  @ApiProperty({ example: '12 rue des Alpes, 69000 Lyon, France' })
  address: string;

  @ApiProperty({ example: 45.764 })
  lat: number;

  @ApiProperty({ example: 4.8357 })
  lng: number;

  @ApiProperty({ type: [CenterActivityItemDto] })
  activities: CenterActivityItemDto[];
}
