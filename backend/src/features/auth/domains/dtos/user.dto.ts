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

/**
 * UserResponseDto — Representation exposee d'un utilisateur.
 * Liste blanche stricte : aucun secret (password, refreshTokenHash,
 * emailVerificationToken, passwordResetTokenHash, twoFactorCode) ni donnee de
 * sante n'est exposee. Seule cette classe doit etre renvoyee par les routes
 * /users.
 */
export class UserResponseDto {
  @ApiProperty({
    description: "Identifiant unique de l'utilisateur",
    example: '68b4d59919d9b7a94b4fde21',
  })
  id: string;

  @ApiProperty({ description: 'Email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Prenom', example: 'Jean' })
  firstName: string;

  @ApiProperty({ description: 'Nom', example: 'Dupont' })
  lastName: string;

  @ApiProperty({
    description: 'Date de naissance (ISO 8601)',
    example: '1995-05-15T00:00:00.000Z',
  })
  birthDate: string;

  @ApiProperty({
    description: "Role de l'utilisateur",
    example: 'aventurier',
    enum: ['aventurier', 'professionnel', 'admin'],
  })
  role: string;

  @ApiProperty({
    description: 'Statut du compte',
    example: 'active',
    enum: ['active', 'suspended', 'banned'],
  })
  status: string;

  @ApiProperty({ description: 'Email verifie', example: true })
  emailVerified: boolean;

  @ApiProperty({ description: 'Acceptation CGU', example: true })
  acceptCgu: boolean;

  @ApiProperty({ description: 'Acceptation RGPD', example: true })
  acceptRgpd: boolean;

  @ApiProperty({ description: '2FA activee', example: false })
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

  @ApiProperty({ description: 'Prenom', example: 'Jean', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Nom', example: 'Dupont', required: false })
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
    description: 'Recevoir les confirmations de reservation par email',
    example: true,
  })
  @IsBoolean()
  @IsDefined()
  bookingConfirmation: boolean;

  @ApiProperty({
    description: 'Recevoir les rappels par email',
    example: true,
  })
  @IsBoolean()
  @IsDefined()
  reminders: boolean;

  @ApiProperty({
    description: 'Recevoir les emails marketing',
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
    description: 'Recevoir les confirmations de reservation par SMS',
    example: true,
  })
  @IsBoolean()
  @IsDefined()
  bookingConfirmation: boolean;

  @ApiProperty({
    description: 'Recevoir les rappels par SMS',
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
    description: 'Preferences de notifications par email',
    type: NotificationPreferencesEmailDto,
  })
  @ValidateNested()
  @Type(() => NotificationPreferencesEmailDto)
  @IsDefined()
  email: NotificationPreferencesEmailDto;

  @ApiProperty({
    description: 'Preferences de notifications par SMS',
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
    description: 'Indique si les preferences ont ete mises a jour',
    example: true,
  })
  updated: boolean;

  @ApiProperty({
    description: 'Preferences de notifications mises a jour',
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
    description: 'Contre-indications medicales dechiffrees',
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
    description: "Identifiant unique de la demande d'export",
    example: 'rgpd-export-68b4d59919d9b7a94b4fde21',
  })
  requestId: string;

  @ApiProperty({
    description: "Statut de la demande d'export",
    example: 'completed',
    enum: ['completed'],
  })
  status: 'completed';

  @ApiProperty({
    description: "Date de realisation de l'export (ISO 8601)",
    example: '2026-05-13T12:00:00.000Z',
  })
  completedAt: string;

  @ApiProperty({
    description: "Contenu complet de l'export",
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
    description: 'Code de confirmation recu par email (double consentement)',
    example: 'CONFIRM-ABC123',
  })
  @IsString()
  @IsNotEmpty()
  confirmationCode: string;

  @ApiProperty({
    description: 'Raison optionnelle de la demande de suppression',
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
    description: 'Identifiant unique de la demande de suppression',
    example: 'rgpd-delete-68b4d59919d9b7a94b4fde21',
  })
  requestId: string;

  @ApiProperty({
    description: 'Date planifiee de suppression (J+30 — delai de retractation)',
    example: '2026-06-12T12:00:00.000Z',
  })
  scheduledDeletionAt: string;

  @ApiProperty({
    description:
      'Donnees conservees pour obligation legale (ex. factures 10 ans)',
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
    description: 'Identifiant de la réservation',
    example: '68b4d59919d9b7a94b4fde21',
  })
  bookingId: string;

  @ApiProperty({
    description: "Titre de l'activité réservée",
    example: 'Parachute en tandem',
  })
  activityTitle: string;

  @ApiProperty({
    description: 'Date de début du créneau (ISO 8601)',
    example: '2026-06-15T09:00:00.000Z',
  })
  slotStartAt: string;

  @ApiProperty({
    description: 'Statut de la réservation',
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
    description: "Identifiant de l'activité",
    example: '68b4d59919d9b7a94b4fde21',
  })
  activityId: string;

  @ApiProperty({
    description: "Titre de l'activité",
    example: 'Parachute en tandem',
  })
  title: string;

  @ApiProperty({
    description: "Type de l'activité",
    example: 'parachute',
  })
  type: string;

  @ApiProperty({
    description: 'Prix de départ en euros',
    example: 150,
  })
  priceFromEur: number;

  @ApiProperty({
    description: 'Niveau de difficulté',
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  difficulty: string;

  @ApiProperty({
    description: 'URL de la photo de couverture',
    example: 'https://cdn.adrenabook.fr/photos/abc123.jpg',
  })
  coverPhotoUrl: string;
}

/**
 * DashboardResponseDto — Réponse du dashboard aventurier (US-29)
 */
export class DashboardResponseDto {
  @ApiProperty({
    description: "Prénom de l'utilisateur connecté",
    example: 'Rémi',
  })
  firstName: string;

  @ApiProperty({
    description: "Les 3 prochaines réservations de l'utilisateur",
    type: [BookingSummaryDto],
  })
  upcomingBookings: BookingSummaryDto[];

  @ApiProperty({
    description:
      "4 activités suggérées (basées sur l'historique ou aléatoires)",
    type: [ActivitySummaryDto],
  })
  suggestedActivities: ActivitySummaryDto[];
}

export class RefreshTokenDto {
  @ApiProperty({
    description:
      'Refresh token obtenu a la connexion. Optionnel : a defaut, le jeton est ' +
      'lu dans le cookie httpOnly refresh_token.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
