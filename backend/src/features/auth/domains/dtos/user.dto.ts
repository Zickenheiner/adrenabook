import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  Equals,
} from 'class-validator';

/**
 * RegisterDto — Inscription d'un aventurier (US-01)
 * Validation :
 * - email RFC 5322
 * - password min 12 caracteres, regex de complexite (majuscule, chiffre, caractere special)
 * - acceptCgu et acceptRgpd doivent etre true
 */
export class RegisterDto {
  @ApiProperty({
    description: "Email de l'aventurier (format RFC 5322)",
    example: 'aventurier@example.com',
  })
  @IsEmail({}, { message: "L'email doit etre au format valide (RFC 5322)" })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description:
      'Mot de passe (min 12 caracteres, au moins 1 majuscule, 1 chiffre et 1 caractere special)',
    example: 'MySecureP@ssw0rd!',
    minLength: 12,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(12, {
    message: 'Le mot de passe doit contenir au moins 12 caracteres',
  })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractere special',
  })
  password: string;

  @ApiProperty({
    description: "Prenom de l'aventurier",
    example: 'Jean',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: "Nom de l'aventurier",
    example: 'Dupont',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Date de naissance au format ISO 8601 (majeur requis)',
    example: '1995-05-15',
  })
  @IsDateString(
    {},
    { message: 'La date de naissance doit etre au format ISO 8601' },
  )
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({
    description:
      "Acceptation des Conditions Generales d'Utilisation (doit etre true)",
    example: true,
  })
  @IsBoolean()
  @Equals(true, { message: 'Vous devez accepter les CGU' })
  acceptCgu: boolean;

  @ApiProperty({
    description: 'Acceptation de la politique RGPD (doit etre true)',
    example: true,
  })
  @IsBoolean()
  @Equals(true, { message: 'Vous devez accepter la politique RGPD' })
  acceptRgpd: boolean;
}

/**
 * RegisterResponseDto — Reponse a l'inscription
 */
export class RegisterResponseDto {
  @ApiProperty({
    description: "Identifiant unique de l'utilisateur cree",
    example: '68b4d59919d9b7a94b4fde21',
  })
  userId: string;

  @ApiProperty({
    description: "Email de l'utilisateur cree",
    example: 'aventurier@example.com',
  })
  email: string;

  @ApiProperty({
    description: "Indique si l'email de verification a ete envoye",
    example: true,
  })
  emailVerificationSent: boolean;
}

/**
 * DTOs CRUD legacy (non utilises par US-01 mais conserves pour la base)
 */
export class CreateUserDto {
  @ApiProperty({ description: 'Email', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Password hash', example: 'hashed-password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Prenom', example: 'Jean' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Nom', example: 'Dupont' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Date de naissance', example: '1995-05-15' })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({ description: 'Acceptation CGU', example: true })
  @IsBoolean()
  acceptCgu: boolean;

  @ApiProperty({ description: 'Acceptation RGPD', example: true })
  @IsBoolean()
  acceptRgpd: boolean;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'Email',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Prenom', example: 'Jean', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Nom', example: 'Dupont', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;
}
