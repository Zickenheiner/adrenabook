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
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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
 * LoginDto — Connexion securisee (US-02)
 * Validation :
 * - email RFC 5322
 * - password non vide
 * - twoFactorCode optionnel (requis si 2FA active sur le compte)
 */
export class LoginDto {
  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'aventurier@example.com',
  })
  @IsEmail({}, { message: "L'email doit etre au format valide (RFC 5322)" })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "Mot de passe de l'utilisateur",
    example: 'MySecureP@ssw0rd!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Code 2FA recu par email (requis si 2FA active)',
    example: '123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  twoFactorCode?: string;
}

/**
 * UserPublicDto — Informations publiques retournees apres login
 */
export class UserPublicDto {
  @ApiProperty({
    description: "Identifiant unique de l'utilisateur",
    example: '68b4d59919d9b7a94b4fde21',
  })
  id: string;

  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'aventurier@example.com',
  })
  email: string;

  @ApiProperty({
    description: "Role de l'utilisateur",
    example: 'aventurier',
    enum: ['aventurier', 'professionnel', 'admin'],
  })
  role: 'aventurier' | 'professionnel' | 'admin';
}

/**
 * LoginResponseDto — Reponse a la connexion reussie
 */
export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token (duree de vie 15 minutes)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description:
      'Refresh token (duree de vie 7 jours, egalement defini en cookie httpOnly)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: "Informations publiques de l'utilisateur connecte",
    type: UserPublicDto,
  })
  user: UserPublicDto;
}

/**
 * PasswordResetRequestDto — Demande de reinitialisation du mot de passe (US-03)
 * Validation :
 * - email RFC 5322
 */
export class PasswordResetRequestDto {
  @ApiProperty({
    description: "Email de l'utilisateur qui demande la reinitialisation",
    example: 'aventurier@example.com',
  })
  @IsEmail({}, { message: "L'email doit etre au format valide (RFC 5322)" })
  @IsNotEmpty()
  email: string;
}

/**
 * PasswordResetRequestResponseDto — Reponse generique a la demande de reinitialisation
 * Reponse generique pour eviter l'enumeration d'utilisateurs.
 */
export class PasswordResetRequestResponseDto {
  @ApiProperty({
    description:
      "Message generique. Renvoye que l'email existe ou non, pour eviter l'enumeration d'utilisateurs.",
    example:
      'Si un compte existe pour cet email, un lien de reinitialisation a ete envoye.',
  })
  message: string;
}

/**
 * PasswordResetConfirmDto — Confirmation de la reinitialisation du mot de passe (US-03)
 * Validation :
 * - token non vide (signe HMAC, expiration 1h)
 * - newPassword min 12 caracteres, regex de complexite
 */
export class PasswordResetConfirmDto {
  @ApiProperty({
    description:
      'Token signe HMAC recu par email (expiration 1h, usage unique)',
    example: 'a1b2c3d4e5f6.7g8h9i0j1k2l.m3n4o5p6q7r8',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description:
      'Nouveau mot de passe (min 12 caracteres, au moins 1 majuscule, 1 chiffre et 1 caractere special)',
    example: 'MyN3wSecureP@ss!',
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
  newPassword: string;
}

/**
 * PasswordResetConfirmResponseDto — Reponse a la confirmation de reinitialisation
 */
export class PasswordResetConfirmResponseDto {
  @ApiProperty({
    description: 'Message de succes',
    example: 'Mot de passe modifie avec succes',
  })
  message: string;
}

/**
 * EmergencyContactDto — Personne a prevenir en urgence (US-05)
 */
export class EmergencyContactDto {
  @ApiProperty({
    description: 'Nom complet de la personne a prevenir',
    example: 'Marie Dupont',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Relation avec la personne a prevenir',
    example: 'Conjoint(e)',
  })
  @IsString()
  @IsNotEmpty()
  relation: string;

  @ApiProperty({
    description: 'Numero de telephone de la personne a prevenir',
    example: '+33612345678',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

/**
 * HealthProfileDto — Profil de sante de l'aventurier (US-05)
 * Champs sensibles : medicalContraindications est chiffre en AES-256 en BDD.
 */
export class HealthProfileDto {
  @ApiProperty({
    description: 'Poids en kg (requis pour saut elastique)',
    example: 75,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({
    description: 'Taille en cm',
    example: 178,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({
    description: 'Contre-indications medicales (stockees chiffrees en AES-256)',
    example: ['Hypertension', 'Asthme'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  medicalContraindications?: string[];

  @ApiProperty({
    description: "Personne a prevenir en cas d'urgence",
    type: EmergencyContactDto,
  })
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact: EmergencyContactDto;

  @ApiProperty({
    description:
      'Identifiant du fichier certificat medical (requis pour certaines activites)',
    example: 'file-abc123',
    required: false,
  })
  @IsString()
  @IsOptional()
  medicalCertificateFileId?: string;
}

/**
 * HealthProfileResponseDto — Reponse a la mise a jour du profil de sante (US-05)
 */
export class HealthProfileResponseDto {
  @ApiProperty({
    description: 'Indique si le profil a ete mis a jour',
    example: true,
  })
  updated: boolean;

  @ApiProperty({
    description: 'Liste des champs chiffres pour tracabilite',
    example: ['medicalContraindications'],
    type: [String],
  })
  fieldsEncrypted: string[];
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
