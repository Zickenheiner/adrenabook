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
  @ApiProperty({ description: 'Rue', example: '12 rue des Alpes' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: 'Ville', example: 'Chamonix' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Code postal', example: '74400' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ description: 'Pays', example: 'France' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class LegalRepresentativeDto {
  @ApiProperty({
    description: 'Prénom du représentant légal',
    example: 'Marie',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Nom du représentant légal', example: 'Dupont' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Rôle du représentant légal', example: 'Gérant' })
  @IsString()
  @IsNotEmpty()
  role: string;
}

export class DocumentsDto {
  @ApiProperty({
    description: 'ID du fichier Kbis uploadé via /uploads',
    example: 'file_abc123',
  })
  @IsString()
  @IsNotEmpty()
  kbisFileId: string;

  @ApiProperty({
    description: 'ID du fichier RC Pro uploadé via /uploads',
    example: 'file_def456',
  })
  @IsString()
  @IsNotEmpty()
  rcProFileId: string;

  @ApiProperty({
    description: 'IDs des diplômes des encadrants uploadés via /uploads',
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
    description: 'Nom de la société / du centre outdoor',
    example: 'Alpes Aventures SARL',
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'Numéro SIRET (14 chiffres, validation Luhn)',
    example: '73282932000074',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{14}$/, {
    message: 'Le SIRET doit contenir exactement 14 chiffres',
  })
  siret: string;

  @ApiProperty({
    description: 'Email de contact du centre',
    example: 'contact@alpesaventures.fr',
  })
  @IsString()
  @IsNotEmpty()
  contactEmail: string;

  @ApiProperty({
    description: 'Téléphone de contact du centre',
    example: '+33450000000',
  })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @ApiProperty({
    description: 'Adresse du centre',
    type: AddressDto,
  })
  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({
    description: 'Représentant légal du centre',
    type: LegalRepresentativeDto,
  })
  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => LegalRepresentativeDto)
  legalRepresentative: LegalRepresentativeDto;

  @ApiProperty({
    description: 'Documents KYC (Kbis, RC Pro, diplômes encadrants)',
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
    description: 'Identifiant unique du centre créé',
    example: '68b4d59919d9b7a94b4fde21',
  })
  centerId: string;

  @ApiProperty({
    description: 'Statut du dossier soumis',
    example: 'pending_review',
    enum: ['pending_review'],
  })
  status: 'pending_review';

  @ApiProperty({
    description: 'Délai estimé de revue du dossier',
    example: '48h ouvrées',
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
    description: 'Nom de la société',
    example: 'Alpes Aventures SARL',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  companyName?: string;

  @ApiProperty({
    description: 'Email de contact',
    example: 'contact@alpes-aventures.fr',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiProperty({
    description: 'Téléphone de contact',
    example: '+33450123456',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  contactPhone?: string;

  @ApiProperty({
    description: 'Adresse du centre. Sa modification déclenche un regéocodage.',
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

  @ApiProperty({ type: AddressDto })
  address: AddressDto;

  @ApiProperty({ example: 3 })
  activitiesCount: number;
}
