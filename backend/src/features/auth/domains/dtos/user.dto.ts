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
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserEntity } from '@features/auth/domains/entities/user.entity';

/**
 * RegisterDto — Inscription d'un aventurier (US-01)
 * Validation :
 * - email RFC 5322
 * - password min 12 caracteres, regex de complexite (majuscule, chiffre, caractere special)
 * - acceptCgu et acceptRgpd doivent etre true
 */
export class RegisterDto {
  @ApiProperty({
    description: "Adventurer's email address (RFC 5322 format)",
    example: 'aventurier@example.com',
  })
  @IsEmail({}, { message: "L'email doit etre au format valide (RFC 5322)" })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description:
      'Password (minimum 12 characters, including at least 1 uppercase letter, 1 digit and 1 special character)',
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
    description: "Adventurer's first name",
    example: 'Jean',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: "Adventurer's last name",
    example: 'Dupont',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description:
      'Date of birth in ISO 8601 format (the user must be of legal age)',
    example: '1995-05-15',
  })
  @IsDateString(
    {},
    { message: 'La date de naissance doit etre au format ISO 8601' },
  )
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({
    description: 'Acceptance of the terms of service (must be true)',
    example: true,
  })
  @IsBoolean()
  @Equals(true, { message: 'Vous devez accepter les CGU' })
  acceptCgu: boolean;

  @ApiProperty({
    description: 'Acceptance of the GDPR policy (must be true)',
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
    description: 'Unique identifier of the created user',
    example: '68b4d59919d9b7a94b4fde21',
  })
  userId: string;

  @ApiProperty({
    description: 'Email address of the created user',
    example: 'aventurier@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Indicates whether the verification email has been sent',
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
    description: "User's email address",
    example: 'aventurier@example.com',
  })
  @IsEmail({}, { message: "L'email doit etre au format valide (RFC 5322)" })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "User's password",
    example: 'MySecureP@ssw0rd!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: '2FA code received by email (required when 2FA is enabled)',
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
    description: 'Unique identifier of the user',
    example: '68b4d59919d9b7a94b4fde21',
  })
  id: string;

  @ApiProperty({
    description: "User's email address",
    example: 'aventurier@example.com',
  })
  email: string;

  @ApiProperty({
    description: "User's role",
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
    description: 'JWT access token (15-minute lifetime)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description:
      'Refresh token (7-day lifetime, also set as an httpOnly cookie)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Public information about the signed-in user',
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
    description: 'Email address of the user requesting the password reset',
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
      'Generic message. Returned whether or not the email exists, in order to prevent user enumeration.',
    example:
      'If an account exists for this email address, a reset link has been sent.',
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
      'HMAC-signed token received by email (expires after 1 hour, single use)',
    example: 'a1b2c3d4e5f6.7g8h9i0j1k2l.m3n4o5p6q7r8',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description:
      'New password (minimum 12 characters, including at least 1 uppercase letter, 1 digit and 1 special character)',
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
    description: 'Success message',
    example: 'Mot de passe modifie avec succes',
  })
  message: string;
}

/**
 * EmergencyContactDto — Personne a prevenir en urgence (US-05)
 */
export class EmergencyContactDto {
  @ApiProperty({
    description: 'Full name of the emergency contact',
    example: 'Marie Dupont',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Relationship to the emergency contact',
    example: 'Conjoint(e)',
  })
  @IsString()
  @IsNotEmpty()
  relation: string;

  @ApiProperty({
    description: 'Phone number of the emergency contact',
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
    description: 'Weight in kg (required for bungee jumping)',
    example: 75,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({
    description: 'Height in cm',
    example: 178,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({
    description: 'Medical contraindications (stored AES-256 encrypted)',
    example: ['Hypertension', 'Asthme'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  medicalContraindications?: string[];

  @ApiProperty({
    description: 'Person to contact in case of emergency',
    type: EmergencyContactDto,
  })
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact: EmergencyContactDto;

  @ApiProperty({
    description:
      'Identifier of the medical certificate file (required for some activities)',
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
    description: 'Indicates whether the profile has been updated',
    example: true,
  })
  updated: boolean;

  @ApiProperty({
    description: 'List of the encrypted fields, for traceability',
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

  @ApiProperty({ description: 'First name', example: 'Jean' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Dupont' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Date of birth', example: '1995-05-15' })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({ description: 'Terms of service acceptance', example: true })
  @IsBoolean()
  acceptCgu: boolean;

  @ApiProperty({ description: 'GDPR policy acceptance', example: true })
  @IsBoolean()
  acceptRgpd: boolean;
}

/**
 * UserResponseDto — Representation exposee d'un utilisateur.
 * Liste blanche stricte : aucun secret (password, refreshTokenHash,
 * emailVerificationToken, passwordResetTokenHash, twoFactorCode) ni donnee de
 * sante n'est exposee. Seule cette classe doit etre renvoyee par les routes
 * /users.
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '68b4d59919d9b7a94b4fde21',
  })
  id: string;

  @ApiProperty({ description: 'Email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'First name', example: 'Jean' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Dupont' })
  lastName: string;

  @ApiProperty({
    description: 'Date of birth (ISO 8601)',
    example: '1995-05-15T00:00:00.000Z',
  })
  birthDate: string;

  @ApiProperty({
    description: "User's role",
    example: 'aventurier',
    enum: ['aventurier', 'professionnel', 'admin'],
  })
  role: string;

  @ApiProperty({
    description: 'Account status',
    example: 'active',
    enum: ['active', 'suspended', 'banned'],
  })
  status: string;

  @ApiProperty({ description: 'Email verified', example: true })
  emailVerified: boolean;

  @ApiProperty({ description: 'Terms of service acceptance', example: true })
  acceptCgu: boolean;

  @ApiProperty({ description: 'GDPR policy acceptance', example: true })
  acceptRgpd: boolean;

  @ApiProperty({ description: '2FA enabled', example: false })
  twoFactorEnabled: boolean;

  static fromEntity(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.getId();
    dto.email = entity.getEmail();
    dto.firstName = entity.getFirstName();
    dto.lastName = entity.getLastName();
    const birthDate = entity.getBirthDate();
    dto.birthDate =
      birthDate instanceof Date ? birthDate.toISOString() : String(birthDate);
    dto.role = entity.getRole();
    dto.status = entity.getStatus();
    dto.emailVerified = entity.getEmailVerified();
    dto.acceptCgu = entity.getAcceptCgu();
    dto.acceptRgpd = entity.getAcceptRgpd();
    dto.twoFactorEnabled = entity.getTwoFactorEnabled();
    return dto;
  }
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

  @ApiProperty({ description: 'First name', example: 'Jean', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Last name', example: 'Dupont', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;
}

// ——— Preferences de notifications US-14 ———

/**
 * NotificationPreferencesEmailDto — Preferences email
 */
export class NotificationPreferencesEmailDto {
  @ApiProperty({
    description: 'Receive booking confirmations by email',
    example: true,
  })
  @IsBoolean()
  @IsDefined()
  bookingConfirmation: boolean;

  @ApiProperty({
    description: 'Receive reminders by email',
    example: true,
  })
  @IsBoolean()
  @IsDefined()
  reminders: boolean;

  @ApiProperty({
    description: 'Receive marketing emails',
    example: false,
  })
  @IsBoolean()
  @IsDefined()
  marketing: boolean;
}

/**
 * NotificationPreferencesSmsDto — Preferences SMS
 */
export class NotificationPreferencesSmsDto {
  @ApiProperty({
    description: 'Receive booking confirmations by SMS',
    example: true,
  })
  @IsBoolean()
  @IsDefined()
  bookingConfirmation: boolean;

  @ApiProperty({
    description: 'Receive reminders by SMS',
    example: true,
  })
  @IsBoolean()
  @IsDefined()
  reminders: boolean;
}

/**
 * NotificationPreferencesDto — Mise a jour des preferences de notifications (US-14)
 */
export class NotificationPreferencesDto {
  @ApiProperty({
    description: 'Email notification preferences',
    type: NotificationPreferencesEmailDto,
  })
  @ValidateNested()
  @Type(() => NotificationPreferencesEmailDto)
  @IsDefined()
  email: NotificationPreferencesEmailDto;

  @ApiProperty({
    description: 'SMS notification preferences',
    type: NotificationPreferencesSmsDto,
  })
  @ValidateNested()
  @Type(() => NotificationPreferencesSmsDto)
  @IsDefined()
  sms: NotificationPreferencesSmsDto;
}

/**
 * NotificationPreferencesResponseDto — Reponse a la mise a jour des preferences (US-14)
 */
export class NotificationPreferencesResponseDto {
  @ApiProperty({
    description: 'Indicates whether the preferences have been updated',
    example: true,
  })
  updated: boolean;

  @ApiProperty({
    description: 'Updated notification preferences',
    type: NotificationPreferencesDto,
  })
  preferences: NotificationPreferencesDto;
}

// ——— RGPD US-24 ———

/**
 * RgpdExportProfileDto — Donnees de profil incluses dans l'export RGPD (US-24)
 */
export class RgpdExportProfileDto {
  @ApiProperty({ example: '68b4d59919d9b7a94b4fde21' })
  userId: string;

  @ApiProperty({ example: 'aventurier@example.com' })
  email: string;

  @ApiProperty({ example: 'Jean' })
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  lastName: string;

  @ApiProperty({ example: '1995-05-15T00:00:00.000Z' })
  birthDate: string;

  @ApiProperty({ example: 'aventurier' })
  role: string;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: true })
  emailVerified: boolean;

  @ApiProperty({ example: true })
  acceptCgu: boolean;

  @ApiProperty({ example: true })
  acceptRgpd: boolean;
}

/**
 * RgpdExportHealthProfileDto — Profil de sante inclus dans l'export RGPD (US-24)
 * Les contre-indications medicales sont dechiffrees pour etre restituees en
 * clair a leur proprietaire (droit d'acces RGPD).
 */
export class RgpdExportHealthProfileDto {
  @ApiProperty({ example: 75, required: false })
  weight?: number;

  @ApiProperty({ example: 178, required: false })
  height?: number;

  @ApiProperty({
    description: 'Decrypted medical contraindications',
    example: ['Hypertension'],
    type: [String],
    required: false,
  })
  medicalContraindications?: string[];

  @ApiProperty({ type: EmergencyContactDto, required: false })
  emergencyContact?: EmergencyContactDto;

  @ApiProperty({ example: 'file-abc123', required: false })
  medicalCertificateFileId?: string;
}

/**
 * RgpdExportBookingDto — Reservation incluse dans l'export RGPD (US-24)
 */
export class RgpdExportBookingDto {
  @ApiProperty({ example: '68b4d59919d9b7a94b4fde21' })
  bookingId: string;

  @ApiProperty({ example: '68b4d59919d9b7a94b4fde30' })
  slotId: string;

  @ApiProperty({ example: 'confirmed' })
  status: string;

  @ApiProperty({ example: 150 })
  totalEur: number;

  @ApiProperty({ example: 30 })
  vatEur: number;

  @ApiProperty({ example: 2 })
  participantsCount: number;

  @ApiProperty({ example: '2026-06-15T09:00:00.000Z', required: false })
  createdAt?: string;
}

/**
 * RgpdExportInvoiceDto — Facture incluse dans l'export RGPD (US-24)
 */
export class RgpdExportInvoiceDto {
  @ApiProperty({ example: '68b4d59919d9b7a94b4fde40' })
  invoiceId: string;

  @ApiProperty({ example: 'FA-2026-000123' })
  invoiceNumber: string;

  @ApiProperty({ example: '68b4d59919d9b7a94b4fde21' })
  bookingId: string;

  @ApiProperty({ example: '2026-06-15T09:00:00.000Z' })
  issuedAt: string;

  @ApiProperty({ example: 150 })
  totalEur: number;

  @ApiProperty({ example: 30 })
  vatEur: number;
}

/**
 * RgpdExportDataDto — Contenu de l'export RGPD (US-24)
 */
export class RgpdExportDataDto {
  @ApiProperty({ type: RgpdExportProfileDto })
  profile: RgpdExportProfileDto;

  @ApiProperty({ type: RgpdExportHealthProfileDto, required: false })
  healthProfile?: RgpdExportHealthProfileDto;

  @ApiProperty({ type: NotificationPreferencesDto, required: false })
  notificationPreferences?: NotificationPreferencesDto;

  @ApiProperty({ type: [RgpdExportBookingDto] })
  bookings: RgpdExportBookingDto[];

  @ApiProperty({ type: [RgpdExportInvoiceDto] })
  invoices: RgpdExportInvoiceDto[];
}

/**
 * RgpdExportResponseDto — Reponse a la demande d'export RGPD (US-24)
 * L'export est traite de facon synchrone : les donnees sont renvoyees
 * directement dans la reponse (aucun worker asynchrone n'existe).
 */
export class RgpdExportResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the export request',
    example: 'rgpd-export-68b4d59919d9b7a94b4fde21',
  })
  requestId: string;

  @ApiProperty({
    description: 'Status of the export request',
    example: 'completed',
    enum: ['completed'],
  })
  status: 'completed';

  @ApiProperty({
    description: 'Date on which the export was completed (ISO 8601)',
    example: '2026-05-13T12:00:00.000Z',
  })
  completedAt: string;

  @ApiProperty({
    description: 'Full content of the export',
    type: RgpdExportDataDto,
  })
  data: RgpdExportDataDto;
}

/**
 * RgpdDeleteDto — Corps de la demande de suppression RGPD (US-24)
 * Necessite un code de confirmation envoye par email (double consentement).
 */
export class RgpdDeleteDto {
  @ApiProperty({
    description: 'Confirmation code received by email (double consent)',
    example: 'CONFIRM-ABC123',
  })
  @IsString()
  @IsNotEmpty()
  confirmationCode: string;

  @ApiProperty({
    description: 'Optional reason for the deletion request',
    example: 'Je ne souhaite plus utiliser le service',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * RgpdDeleteResponseDto — Reponse a la demande de suppression RGPD (US-24)
 */
export class RgpdDeleteResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the deletion request',
    example: 'rgpd-delete-68b4d59919d9b7a94b4fde21',
  })
  requestId: string;

  @ApiProperty({
    description: 'Scheduled deletion date (D+30 — withdrawal period)',
    example: '2026-06-12T12:00:00.000Z',
  })
  scheduledDeletionAt: string;

  @ApiProperty({
    description:
      'Data retained to meet a legal obligation (e.g. invoices kept for 10 years)',
    example: ['invoices for legal retention'],
    type: [String],
  })
  retainedData: string[];
}

// ——— Dashboard aventurier US-29 ———

/**
 * BookingSummaryDto — Résumé d'une réservation pour le dashboard (US-29)
 */
export class BookingSummaryDto {
  @ApiProperty({
    description: 'Booking identifier',
    example: '68b4d59919d9b7a94b4fde21',
  })
  bookingId: string;

  @ApiProperty({
    description: 'Title of the booked activity',
    example: 'Parachute en tandem',
  })
  activityTitle: string;

  @ApiProperty({
    description: 'Slot start date (ISO 8601)',
    example: '2026-06-15T09:00:00.000Z',
  })
  slotStartAt: string;

  @ApiProperty({
    description: 'Name of the center offering the activity',
    example: 'Chamonix Vertical',
  })
  centerName: string;

  @ApiProperty({
    description:
      'Cover image identifier, to be resolved via GET /activities/photos/:fileId',
    example: '68b4d59919d9b7a94b4fde99',
  })
  coverPhotoUrl: string;

  @ApiProperty({
    description: 'Booking status',
    example: 'confirmed',
    enum: [
      'pending_payment',
      'confirmed',
      'partial_paid',
      'cancelled',
      'completed',
    ],
  })
  status: string;
}

/**
 * ActivitySummaryDto — Résumé d'une activité suggérée pour le dashboard (US-29)
 */
export class ActivitySummaryDto {
  @ApiProperty({
    description: 'Activity identifier',
    example: '68b4d59919d9b7a94b4fde21',
  })
  activityId: string;

  @ApiProperty({
    description: 'Activity title',
    example: 'Parachute en tandem',
  })
  title: string;

  @ApiProperty({
    description: 'Activity type',
    example: 'parachute',
  })
  type: string;

  @ApiProperty({
    description: 'Price per participant in euros',
    example: 150,
  })
  priceEur: number;

  @ApiProperty({
    description: 'Activity duration in minutes',
    example: 120,
  })
  durationMinutes: number;

  @ApiProperty({
    description: 'Difficulty level',
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  difficulty: string;

  @ApiProperty({
    description: 'Name of the center offering the activity',
    example: 'Arkose Toulouse',
  })
  centerName: string;

  @ApiProperty({
    description: 'Cover photo file identifier',
    example: '68b4d59919d9b7a94b4fde21',
  })
  coverPhotoUrl: string;
}

/**
 * DashboardResponseDto — Réponse du dashboard aventurier (US-29)
 */
export class DashboardResponseDto {
  @ApiProperty({
    description: "Signed-in user's first name",
    example: 'Rémi',
  })
  firstName: string;

  @ApiProperty({
    description: "The user's 3 next bookings",
    type: [BookingSummaryDto],
  })
  upcomingBookings: BookingSummaryDto[];

  @ApiProperty({
    description: '4 suggested activities (based on booking history, or random)',
    type: [ActivitySummaryDto],
  })
  suggestedActivities: ActivitySummaryDto[];
}

export class RefreshTokenDto {
  @ApiProperty({
    description:
      'Refresh token obtained at sign-in. Optional: by default, the token is ' +
      'read from the refresh_token httpOnly cookie.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
