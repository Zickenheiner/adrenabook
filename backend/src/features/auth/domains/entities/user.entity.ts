import { ApiProperty } from '@nestjs/swagger';
import { User } from '../schemas/user.schema';

export class UserEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the user',
  })
  private readonly id: User;

  private email: string;
  private password: string;
  private firstName: string;
  private lastName: string;
  private birthDate: Date;
  private acceptCgu: boolean;
  private acceptRgpd: boolean;
  private emailVerified: boolean;
  private emailVerificationToken?: string;
  private role: string;

  // ——— Statut admin US-22 ———
  private status: string;

  // ——— Champs securite US-02 ———
  private failedLoginAttempts: number;
  private lockedUntil?: Date;
  private twoFactorEnabled: boolean;
  private twoFactorCode?: string;
  private twoFactorCodeExpiresAt?: Date;
  private refreshTokenHash?: string;

  // ——— Champs reinitialisation mot de passe US-03 ———
  private passwordResetTokenHash?: string;
  private passwordResetTokenExpiresAt?: Date;

  // ——— Profil de sante US-05 ———
  private healthProfile?: {
    weight?: number;
    height?: number;
    medicalContraindications?: string[];
    emergencyContact?: {
      fullName: string;
      relation: string;
      phone: string;
    };
    medicalCertificateFileId?: string;
  };

  // ——— Preferences de notifications US-14 ———
  private notificationPreferences?: {
    email: {
      bookingConfirmation: boolean;
      reminders: boolean;
      marketing: boolean;
    };
    sms: {
      bookingConfirmation: boolean;
      reminders: boolean;
    };
  };

  // ——— RGPD US-24 ———
  private rgpdRequest?: {
    requestId: string;
    requestType: 'export' | 'delete';
    status: 'queued' | 'processing' | 'ready' | 'scheduled' | 'completed';
    requestedAt: Date;
    completedAt?: Date;
    scheduledDeletionAt?: Date;
    confirmationCode?: string;
    confirmationCodeExpiresAt?: Date;
  };

  constructor(_id: User) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): User {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getBirthDate(): Date {
    return this.birthDate;
  }

  getAcceptCgu(): boolean {
    return this.acceptCgu;
  }

  getAcceptRgpd(): boolean {
    return this.acceptRgpd;
  }

  getEmailVerified(): boolean {
    return this.emailVerified;
  }

  getEmailVerificationToken(): string | undefined {
    return this.emailVerificationToken;
  }

  getRole(): string {
    return this.role;
  }

  getStatus(): string {
    return this.status;
  }

  getFailedLoginAttempts(): number {
    return this.failedLoginAttempts;
  }

  getLockedUntil(): Date | undefined {
    return this.lockedUntil;
  }

  getTwoFactorEnabled(): boolean {
    return this.twoFactorEnabled;
  }

  getTwoFactorCode(): string | undefined {
    return this.twoFactorCode;
  }

  getTwoFactorCodeExpiresAt(): Date | undefined {
    return this.twoFactorCodeExpiresAt;
  }

  getRefreshTokenHash(): string | undefined {
    return this.refreshTokenHash;
  }

  getPasswordResetTokenHash(): string | undefined {
    return this.passwordResetTokenHash;
  }

  getPasswordResetTokenExpiresAt(): Date | undefined {
    return this.passwordResetTokenExpiresAt;
  }

  // ———————SETTER———————

  setEmail(value: string): void {
    this.email = value;
  }

  setPassword(value: string): void {
    this.password = value;
  }

  setFirstName(value: string): void {
    this.firstName = value;
  }

  setLastName(value: string): void {
    this.lastName = value;
  }

  setBirthDate(value: Date): void {
    this.birthDate = value;
  }

  setAcceptCgu(value: boolean): void {
    this.acceptCgu = value;
  }

  setAcceptRgpd(value: boolean): void {
    this.acceptRgpd = value;
  }

  setEmailVerified(value: boolean): void {
    this.emailVerified = value;
  }

  setEmailVerificationToken(value: string | undefined): void {
    this.emailVerificationToken = value;
  }

  setRole(value: string): void {
    this.role = value;
  }

  setStatus(value: string): void {
    this.status = value;
  }

  setFailedLoginAttempts(value: number): void {
    this.failedLoginAttempts = value;
  }

  setLockedUntil(value: Date | undefined): void {
    this.lockedUntil = value;
  }

  setTwoFactorEnabled(value: boolean): void {
    this.twoFactorEnabled = value;
  }

  setTwoFactorCode(value: string | undefined): void {
    this.twoFactorCode = value;
  }

  setTwoFactorCodeExpiresAt(value: Date | undefined): void {
    this.twoFactorCodeExpiresAt = value;
  }

  setRefreshTokenHash(value: string | undefined): void {
    this.refreshTokenHash = value;
  }

  setPasswordResetTokenHash(value: string | undefined): void {
    this.passwordResetTokenHash = value;
  }

  setPasswordResetTokenExpiresAt(value: Date | undefined): void {
    this.passwordResetTokenExpiresAt = value;
  }

  // ——— Profil de sante US-05 ———

  getHealthProfile():
    | {
        weight?: number;
        height?: number;
        medicalContraindications?: string[];
        emergencyContact?: {
          fullName: string;
          relation: string;
          phone: string;
        };
        medicalCertificateFileId?: string;
      }
    | undefined {
    return this.healthProfile;
  }

  setHealthProfile(
    value:
      | {
          weight?: number;
          height?: number;
          medicalContraindications?: string[];
          emergencyContact?: {
            fullName: string;
            relation: string;
            phone: string;
          };
          medicalCertificateFileId?: string;
        }
      | undefined,
  ): void {
    this.healthProfile = value;
  }

  // ——— Preferences de notifications US-14 ———

  getNotificationPreferences():
    | {
        email: {
          bookingConfirmation: boolean;
          reminders: boolean;
          marketing: boolean;
        };
        sms: {
          bookingConfirmation: boolean;
          reminders: boolean;
        };
      }
    | undefined {
    return this.notificationPreferences;
  }

  setNotificationPreferences(
    value:
      | {
          email: {
            bookingConfirmation: boolean;
            reminders: boolean;
            marketing: boolean;
          };
          sms: {
            bookingConfirmation: boolean;
            reminders: boolean;
          };
        }
      | undefined,
  ): void {
    this.notificationPreferences = value;
  }

  // ——— RGPD US-24 ———

  getRgpdRequest():
    | {
        requestId: string;
        requestType: 'export' | 'delete';
        status: 'queued' | 'processing' | 'ready' | 'scheduled' | 'completed';
        requestedAt: Date;
        completedAt?: Date;
        scheduledDeletionAt?: Date;
        confirmationCode?: string;
        confirmationCodeExpiresAt?: Date;
      }
    | undefined {
    return this.rgpdRequest;
  }

  setRgpdRequest(
    value:
      | {
          requestId: string;
          requestType: 'export' | 'delete';
          status: 'queued' | 'processing' | 'ready' | 'scheduled' | 'completed';
          requestedAt: Date;
          completedAt?: Date;
          scheduledDeletionAt?: Date;
          confirmationCode?: string;
          confirmationCodeExpiresAt?: Date;
        }
      | undefined,
  ): void {
    this.rgpdRequest = value;
  }
}
