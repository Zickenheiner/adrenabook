import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @ApiProperty({ description: 'Street', example: '12 rue des Alpes' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: 'City', example: 'Chamonix' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Postal code', example: '74400' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ description: 'Country', example: 'France' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class DocumentsDto {
  @ApiProperty({
    description: 'ID of the Kbis file uploaded via /uploads',
    example: 'file_abc123',
  })
  @IsString()
  @IsNotEmpty()
  kbisFileId: string;

  @ApiProperty({
    description:
      'ID of the RC Pro liability insurance file uploaded via /uploads',
    example: 'file_def456',
  })
  @IsString()
  @IsNotEmpty()
  rcProFileId: string;

  @ApiProperty({
    description: 'IDs of the instructor diplomas uploaded via /uploads',
    example: ['file_dip001', 'file_dip002'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  instructorDiplomas: string[];
}

/**
 * RegisterProfessionalDto — Inscription d'un centre professionnel (US-04)
 * Validation :
 * - siret 14 chiffres (validation Luhn)
 * - tous les champs obligatoires
 */
export class RegisterProfessionalDto {
  @ApiProperty({
    description: 'Name of the company / outdoor center',
    example: 'Alpes Aventures SARL',
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'SIRET number (14 digits, Luhn validation)',
    example: '73282932000074',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{14}$/, {
    message: 'Le SIRET doit contenir exactement 14 chiffres',
  })
  siret: string;

  @ApiProperty({
    description: 'Contact email of the center',
    example: 'contact@alpesaventures.fr',
  })
  @IsString()
  @IsNotEmpty()
  contactEmail: string;

  @ApiProperty({
    description: 'Contact phone number of the center',
    example: '+33450000000',
  })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @ApiProperty({
    description: 'Address of the center',
    type: AddressDto,
  })
  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({
    description: 'KYC documents (Kbis, RC Pro, instructor diplomas)',
    type: DocumentsDto,
  })
  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => DocumentsDto)
  documents: DocumentsDto;
}

/**
 * RegisterProfessionalResponseDto — Réponse à l'inscription d'un centre professionnel
 */
export class RegisterProfessionalResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the created center',
    example: '68b4d59919d9b7a94b4fde21',
  })
  centerId: string;

  @ApiProperty({
    description: 'Status of the submitted application',
    example: 'pending_review',
    enum: ['pending_review'],
  })
  status: 'pending_review';

  @ApiProperty({
    description: 'Estimated review time for the application',
    example: '48 business hours',
  })
  estimatedReviewTime: string;
}

export class CreateProfessionalCenterDto extends RegisterProfessionalDto {}

/**
 * Champs qu'un professionnel peut corriger sur son centre.
 *
 * Le SIRET en est volontairement absent, comme les justificatifs, le
 * representant legal et le statut : ils fondent la decision d'instruction du
 * dossier (US-23) et les laisser modifier apres validation reviendrait a
 * approuver une structure puis a en changer l'identite.
 */
export class UpdateProfessionalCenterDto {
  @ApiProperty({
    description: 'Company name',
    example: 'Alpes Aventures SARL',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  companyName?: string;

  @ApiProperty({
    description: 'Contact email',
    example: 'contact@alpes-aventures.fr',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+33450123456',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  contactPhone?: string;

  @ApiProperty({
    description: 'Address of the center. Changing it triggers a re-geocoding.',
    type: AddressDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;
}

/**
 * Centre tel que son proprietaire le voit dans "Mes centres". `activitiesCount`
 * conditionne la suppression : un centre qui porte des activites ne peut pas
 * etre supprime.
 */
export class OwnedCenterDto {
  @ApiProperty({ example: '68b4d59919d9b7a94b4fde21' })
  id: string;

  @ApiProperty({ example: 'Centre Outdoor Lyon' })
  companyName: string;

  @ApiProperty({ example: 'approved' })
  status: string;

  @ApiProperty({ example: 'contact@alpes-aventures.fr' })
  contactEmail: string;

  @ApiProperty({ example: '+33450123456' })
  contactPhone: string;

  @ApiProperty({ type: AddressDto })
  address: AddressDto;

  @ApiProperty({ example: 3 })
  activitiesCount: number;
}
