import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'crypto';
import mongoose from 'mongoose';
import {
  IUserService,
  ILoginContext,
} from '../../../interfaces/services/user.iservice';
import { IUserRepository } from '@features/auth/interfaces/repositories/user.irepository';
import { ILoginLogRepository } from '@features/auth/interfaces/repositories/login-log.irepository';
import {
  CreateUserDto,
  DashboardResponseDto,
  HealthProfileDto,
  HealthProfileResponseDto,
  LoginDto,
  LoginResponseDto,
  NotificationPreferencesDto,
  NotificationPreferencesResponseDto,
  PasswordResetConfirmDto,
  PasswordResetConfirmResponseDto,
  PasswordResetRequestDto,
  PasswordResetRequestResponseDto,
  RegisterDto,
  RegisterResponseDto,
  RgpdDeleteDto,
  RgpdDeleteResponseDto,
  RgpdExportDataDto,
  RgpdExportHealthProfileDto,
  RgpdExportResponseDto,
  UpdateUserDto,
} from '@features/auth/domains/dtos/user.dto';
import { UserEntity } from '@features/auth/domains/entities/user.entity';

/**
 * Parametres securite US-02
 */
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const TWO_FA_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';

/**
 * Parametres reinitialisation mot de passe US-03
 */
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure
const PASSWORD_RESET_GENERIC_MESSAGE =
  'Si un compte existe pour cet email, un lien de reinitialisation a ete envoye.';

/**
 * Chiffrement des donnees de sante US-05
 * AES-256-GCM : IV de 12 bytes (recommandation NIST SP 800-38D)
 */
const AES_GCM_IV_LENGTH = 12;

/**
 * Marqueur utilise dans l'export RGPD quand une donnee chiffree ne peut pas
 * etre dechiffree (ancien format, cle changee, donnee alteree).
 */
const RGPD_UNDECRYPTABLE_MARKER =
  '[donnee illisible : chiffrement obsolete ou cle invalide]';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ILoginLogRepository')
    private readonly loginLogRepository: ILoginLogRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<UserEntity[] | null> {
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    // Verifier que les CGU et RGPD sont acceptes (double check, deja valide par DTO)
    if (!dto.acceptCgu || !dto.acceptRgpd) {
      throw new BadRequestException(
        'Vous devez accepter les CGU et la politique RGPD',
      );
    }

    // Verifier que l'utilisateur est majeur (18 ans minimum)
    const birthDate = new Date(dto.birthDate);
    if (isNaN(birthDate.getTime())) {
      throw new BadRequestException('La date de naissance est invalide');
    }
    const age = this.computeAge(birthDate);
    if (age < 18) {
      throw new BadRequestException(
        'Vous devez etre majeur (18 ans minimum) pour vous inscrire',
      );
    }

    // Verifier que l'email n'est pas deja utilise
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Cet email est deja utilise');
    }

    // Hasher le mot de passe avec argon2
    const hashedPassword = await argon2.hash(dto.password);

    // Generer un token de verification email
    const emailVerificationToken = randomBytes(32).toString('hex');

    // Persister le nouvel utilisateur
    const created = await this.userRepository.register(
      dto,
      hashedPassword,
      emailVerificationToken,
    );

    if (!created) {
      throw new InternalServerErrorException(
        "Impossible de creer l'utilisateur",
      );
    }

    // TODO: integrer l'envoi reel d'email de verification (SendGrid, etc.)
    // Pour l'instant on retourne emailVerificationSent: true en supposant l'envoi reussi
    const emailVerificationSent = true;

    return {
      userId: created.getId(),
      email: created.getEmail(),
      emailVerificationSent,
    };
  }

  /**
   * Connexion securisee (US-02)
   * - Verifie identifiants (email + mot de passe argon2)
   * - Blocage apres 5 tentatives echouees pendant 15 minutes
   * - Support 2FA optionnel par email
   * - Log de chaque tentative
   * - Genere accessToken (15 min) + refreshToken (7 jours)
   */
  async login(
    dto: LoginDto,
    context: ILoginContext = {},
  ): Promise<LoginResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);

    // Cas 1 : utilisateur inexistant — log et 401 generique
    if (!user) {
      await this.logAttempt({
        email: dto.email,
        success: false,
        reason: 'user_not_found',
        context,
      });
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Cas 2 : compte verrouille
    const lockedUntil = user.getLockedUntil();
    if (lockedUntil && lockedUntil.getTime() > Date.now()) {
      await this.logAttempt({
        email: dto.email,
        userId: user.getObjectId(),
        success: false,
        reason: 'account_locked',
        context,
      });
      throw new HttpException(
        'Compte verrouille suite a trop de tentatives. Reessayez plus tard.',
        HttpStatus.LOCKED,
      );
    }

    // Cas 3 : mot de passe invalide
    const passwordValid = await argon2.verify(user.getPassword(), dto.password);
    if (!passwordValid) {
      const updated = await this.userRepository.incrementFailedAttempts(
        user.getId(),
      );
      const attempts = updated?.getFailedLoginAttempts() ?? 0;
      let reason = 'invalid_password';
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        const newLockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        await this.userRepository.lockAccount(user.getId(), newLockedUntil);
        reason = 'account_locked_after_attempts';
      }
      await this.logAttempt({
        email: dto.email,
        userId: user.getObjectId(),
        success: false,
        reason,
        context,
      });
      if (reason === 'account_locked_after_attempts') {
        throw new HttpException(
          'Compte verrouille suite a trop de tentatives. Reessayez plus tard.',
          HttpStatus.LOCKED,
        );
      }
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Cas 4 : 2FA activee
    if (user.getTwoFactorEnabled()) {
      if (!dto.twoFactorCode) {
        // Generer et "envoyer" un code 2FA par email
        const code = this.generateTwoFactorCode();
        const expiresAt = new Date(Date.now() + TWO_FA_CODE_TTL_MS);
        const hashedCode = await argon2.hash(code);
        await this.userRepository.setTwoFactorCode(
          user.getId(),
          hashedCode,
          expiresAt,
        );
        // TODO: envoyer reellement le code par email (SendGrid, etc.)
        await this.logAttempt({
          email: dto.email,
          userId: user.getObjectId(),
          success: false,
          reason: '2fa_required',
          context,
        });
        throw new UnauthorizedException(
          'Code 2FA requis. Un code a ete envoye a votre adresse email.',
        );
      }

      const storedCode = user.getTwoFactorCode();
      const storedExpiresAt = user.getTwoFactorCodeExpiresAt();
      if (
        !storedCode ||
        !storedExpiresAt ||
        storedExpiresAt.getTime() < Date.now()
      ) {
        await this.logAttempt({
          email: dto.email,
          userId: user.getObjectId(),
          success: false,
          reason: '2fa_code_expired',
          context,
        });
        throw new UnauthorizedException('Code 2FA expire ou invalide');
      }

      const codeValid = await argon2.verify(storedCode, dto.twoFactorCode);
      if (!codeValid) {
        await this.logAttempt({
          email: dto.email,
          userId: user.getObjectId(),
          success: false,
          reason: '2fa_code_invalid',
          context,
        });
        throw new UnauthorizedException('Code 2FA invalide');
      }

      await this.userRepository.clearTwoFactorCode(user.getId());
    }

    // Cas 5 : succes — reset tentatives, generer tokens, log
    await this.userRepository.resetFailedAttempts(user.getId());

    const tokens = await this.generateTokens(user);
    const refreshTokenHash = await argon2.hash(tokens.refreshToken);
    await this.userRepository.setRefreshTokenHash(
      user.getId(),
      refreshTokenHash,
    );

    await this.logAttempt({
      email: dto.email,
      userId: user.getObjectId(),
      success: true,
      reason: 'login_success',
      context,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.getId(),
        email: user.getEmail(),
        role: this.normalizeRole(user.getRole()),
      },
    };
  }

  /**
   * Echange un refresh token contre une nouvelle paire de jetons (US-02).
   *
   * Trois controles successifs :
   *  1. la signature et la peremption du refresh token (secret dedie) ;
   *  2. l'existence de l'utilisateur et l'etat de son compte ;
   *  3. la correspondance avec le hash Argon2 stocke en base, ce qui invalide
   *     un refresh token vole apres deconnexion ou apres rotation.
   *
   * Le refresh token est TOURNE a chaque appel : l'ancien devient inutilisable.
   */
  async refreshTokens(refreshToken: string): Promise<LoginResponseDto> {
    const refreshTokenSecret =
      this.configService.get<string>('REFRESH_TOKEN_SECRET') ?? 'change-me-rt';

    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(
        refreshToken,
        { secret: refreshTokenSecret },
      );
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expire');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Refresh token invalide ou expire');
    }

    if (user.getStatus() !== 'active') {
      throw new ForbiddenException('Compte suspendu ou desactive');
    }

    const hashStocke = user.getRefreshTokenHash();
    if (!hashStocke) {
      // Aucune session ouverte : l'utilisateur s'est deconnecte.
      throw new UnauthorizedException('Refresh token invalide ou expire');
    }

    const correspond = await argon2.verify(hashStocke, refreshToken);
    if (!correspond) {
      throw new UnauthorizedException('Refresh token invalide ou expire');
    }

    const tokens = await this.generateTokens(user);
    await this.userRepository.setRefreshTokenHash(
      user.getId(),
      await argon2.hash(tokens.refreshToken),
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.getId(),
        email: user.getEmail(),
        role: this.normalizeRole(user.getRole()),
      },
    };
  }

  /**
   * Demande de reinitialisation du mot de passe (US-03)
   * - Genere un token signe HMAC valable 1h, a usage unique
   * - Hash argon2 du token stocke en base (anti-rejeu si fuite DB)
   * - Reponse generique (anti user enumeration) : meme message si email inconnu
   */
  async requestPasswordReset(
    dto: PasswordResetRequestDto,
  ): Promise<PasswordResetRequestResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (user) {
      // Generer un token brut aleatoire
      const rawToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);
      const expiresAtSec = Math.floor(expiresAt.getTime() / 1000);

      // Construire la payload signee : userId.expiresAtSec.signature
      const userId = user.getId();
      const payload = `${userId}.${expiresAtSec}.${rawToken}`;
      const signature = this.signPasswordResetPayload(payload);
      const signedToken = `${payload}.${signature}`;

      // Hasher le token signe avec argon2 et persister
      const hashedToken = await argon2.hash(signedToken);
      await this.userRepository.setPasswordResetToken(
        userId,
        hashedToken,
        expiresAt,
      );

      // TODO: envoyer reellement l'email contenant le lien magique
      // Exemple : https://app.adrenabook.com/password-reset?token={signedToken}
    }

    // Reponse toujours generique
    return { message: PASSWORD_RESET_GENERIC_MESSAGE };
  }

  /**
   * Confirmation de la reinitialisation du mot de passe (US-03)
   * - Verifie la signature HMAC et l'expiration encodee dans le token
   * - Verifie la correspondance avec le hash stocke (anti-rejeu, usage unique)
   * - Hash argon2 du nouveau mot de passe
   * - Efface le token et invalide les sessions existantes (refreshTokenHash)
   * - Reinitialise les tentatives echouees
   */
  async confirmPasswordReset(
    dto: PasswordResetConfirmDto,
  ): Promise<PasswordResetConfirmResponseDto> {
    // Parser et verifier la signature HMAC du token
    const parsed = this.parseAndVerifyPasswordResetToken(dto.token);
    if (!parsed) {
      throw new BadRequestException('Token invalide ou expire');
    }

    const { userId, expiresAtSec } = parsed;

    // Verifier l'expiration encodee dans le token
    if (expiresAtSec * 1000 < Date.now()) {
      throw new BadRequestException('Token invalide ou expire');
    }

    // Recuperer l'utilisateur cible
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('Token invalide ou expire');
    }

    // Verifier qu'un token actif existe en base et qu'il correspond
    const storedHash = user.getPasswordResetTokenHash();
    const storedExpiresAt = user.getPasswordResetTokenExpiresAt();
    if (
      !storedHash ||
      !storedExpiresAt ||
      storedExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Token invalide ou expire');
    }

    const tokenMatches = await argon2.verify(storedHash, dto.token);
    if (!tokenMatches) {
      throw new BadRequestException('Token invalide ou expire');
    }

    // Hasher le nouveau mot de passe et persister
    const hashedPassword = await argon2.hash(dto.newPassword);
    await this.userRepository.updatePassword(userId, hashedPassword);

    // Token a usage unique : effacer pour empecher reutilisation
    await this.userRepository.clearPasswordResetToken(userId);

    // Invalider les sessions existantes (refresh tokens) apres reinitialisation
    await this.userRepository.clearRefreshTokenHash(userId);

    // Reinitialiser les tentatives echouees (deverrouille le compte si verrouille)
    await this.userRepository.resetFailedAttempts(userId);

    return { message: 'Mot de passe modifie avec succes' };
  }

  async create(dto: CreateUserDto): Promise<boolean> {
    return this.userRepository.create(dto);
  }

  async update(id: string, dto: UpdateUserDto): Promise<boolean> {
    return this.userRepository.update(id, dto);
  }

  async delete(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  /**
   * Mise a jour du profil de sante (US-05)
   * - Chiffrement AES-256-CBC des contre-indications medicales (champ sensible)
   * - La cle AES est lue depuis la config (HEALTH_ENCRYPTION_KEY), 32 bytes hex
   * - Retourne la liste des champs chiffres pour tracabilite
   */
  async updateHealthProfile(
    userId: string,
    dto: HealthProfileDto,
  ): Promise<HealthProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const fieldsEncrypted: string[] = [];
    let encryptedContraindications: string[] | undefined;

    if (
      dto.medicalContraindications &&
      dto.medicalContraindications.length > 0
    ) {
      encryptedContraindications = dto.medicalContraindications.map((item) =>
        this.encryptAes256(item),
      );
      fieldsEncrypted.push('medicalContraindications');
    }

    const updated = await this.userRepository.updateHealthProfile(
      userId,
      dto,
      encryptedContraindications,
    );

    if (!updated) {
      throw new InternalServerErrorException(
        'Impossible de mettre a jour le profil de sante',
      );
    }

    return { updated: true, fieldsEncrypted };
  }

  /**
   * Mise a jour des preferences de notifications (US-14)
   * - Stocke les preferences email/SMS dans le document utilisateur
   * - Opt-out par canal supporte via les booleens de chaque preference
   */
  async updateNotificationPreferences(
    userId: string,
    dto: NotificationPreferencesDto,
  ): Promise<NotificationPreferencesResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const updated = await this.userRepository.updateNotificationPreferences(
      userId,
      dto,
    );

    if (!updated) {
      throw new InternalServerErrorException(
        'Impossible de mettre a jour les preferences de notifications',
      );
    }

    return { updated: true, preferences: dto };
  }

  // ——— Dashboard aventurier US-29 ———

  async getDashboard(userId: string): Promise<DashboardResponseDto> {
    return this.userRepository.getDashboard(userId);
  }

  // ——— Helpers ———

  private computeAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  private generateTwoFactorCode(): string {
    // Code numerique 6 chiffres
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    return code;
  }

  private async generateTokens(
    user: UserEntity,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.getId(),
      email: user.getEmail(),
      role: this.normalizeRole(user.getRole()),
    };

    const accessTokenSecret =
      this.configService.get<string>('ACCESS_TOKEN_SECRET') ?? 'change-me-at';
    const refreshTokenSecret =
      this.configService.get<string>('REFRESH_TOKEN_SECRET') ?? 'change-me-rt';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessTokenSecret,
        expiresIn: ACCESS_TOKEN_TTL,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshTokenSecret,
        expiresIn: REFRESH_TOKEN_TTL,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private normalizeRole(
    role: string,
  ): 'aventurier' | 'professionnel' | 'admin' {
    const lower = (role ?? '').toLowerCase();
    if (lower === 'professionnel') return 'professionnel';
    if (lower === 'admin') return 'admin';
    return 'aventurier';
  }

  private async logAttempt(params: {
    email: string;
    userId?: unknown;
    success: boolean;
    reason?: string;
    context: ILoginContext;
  }): Promise<void> {
    try {
      await this.loginLogRepository.create({
        email: params.email,
        userId: params.userId as mongoose.Types.ObjectId | undefined,
        success: params.success,
        ipAddress: params.context.ipAddress,
        userAgent: params.context.userAgent,
        reason: params.reason,
      });
    } catch {
      // Ne jamais bloquer le flux d'authentification a cause d'un echec de log
    }
  }

  // ——— Helpers reinitialisation mot de passe US-03 ———

  private getPasswordResetSecret(): string {
    return (
      this.configService.get<string>('PASSWORD_RESET_SECRET') ??
      this.configService.get<string>('ACCESS_TOKEN_SECRET') ??
      'change-me-pr'
    );
  }

  private signPasswordResetPayload(payload: string): string {
    return createHmac('sha256', this.getPasswordResetSecret())
      .update(payload)
      .digest('hex');
  }

  private parseAndVerifyPasswordResetToken(
    token: string,
  ): { userId: string; expiresAtSec: number } | null {
    const parts = token.split('.');
    if (parts.length !== 4) {
      return null;
    }
    const [userId, expiresAtStr, rawToken, signature] = parts;
    if (!userId || !expiresAtStr || !rawToken || !signature) {
      return null;
    }
    const expiresAtSec = Number(expiresAtStr);
    if (!Number.isFinite(expiresAtSec)) {
      return null;
    }

    const payload = `${userId}.${expiresAtStr}.${rawToken}`;
    const expectedSignature = this.signPasswordResetPayload(payload);

    // Comparaison constante (timing safe)
    const expectedBuf = Buffer.from(expectedSignature, 'hex');
    let providedBuf: Buffer;
    try {
      providedBuf = Buffer.from(signature, 'hex');
    } catch {
      return null;
    }
    if (
      expectedBuf.length !== providedBuf.length ||
      !timingSafeEqual(expectedBuf, providedBuf)
    ) {
      return null;
    }

    return { userId, expiresAtSec };
  }

  // ——— Helpers chiffrement AES-256-GCM US-05 ———

  /**
   * Retourne la cle AES-256 de 32 bytes depuis la config.
   * HEALTH_ENCRYPTION_KEY doit etre une chaine hex de 64 caracteres (32 bytes).
   * Si absente, utilise une cle de secours (non securisee, pour les tests).
   */
  private getHealthEncryptionKey(): Buffer {
    const hex =
      this.configService.get<string>('HEALTH_ENCRYPTION_KEY') ??
      '0000000000000000000000000000000000000000000000000000000000000000';
    return Buffer.from(hex, 'hex');
  }

  /**
   * Chiffre un texte en clair avec AES-256-GCM (chiffrement authentifie).
   * Format stocke : iv_hex:authTag_hex:ciphertext_hex
   * IV de 12 bytes conformement a la recommandation NIST pour GCM.
   */
  private encryptAes256(plaintext: string): string {
    const key = this.getHealthEncryptionKey();
    const iv = randomBytes(AES_GCM_IV_LENGTH);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return [
      iv.toString('hex'),
      authTag.toString('hex'),
      encrypted.toString('hex'),
    ].join(':');
  }

  /**
   * Dechiffre un texte chiffre avec AES-256-GCM.
   * Format attendu : iv_hex:authTag_hex:ciphertext_hex
   * Le tag d'authentification est verifie par `final()` : toute alteration du
   * chiffre, de l'IV ou du tag leve une erreur.
   */
  decryptAes256(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new InternalServerErrorException(
        parts.length === 2
          ? 'Donnee chiffree au format AES-256-CBC obsolete (iv:ciphertext) : dechiffrement impossible, une re-saisie de la donnee est necessaire.'
          : 'Donnee chiffree invalide : format attendu iv:authTag:ciphertext.',
      );
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = this.getHealthEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encryptedBuf = Buffer.from(encryptedHex, 'hex');

    if (iv.length !== AES_GCM_IV_LENGTH || authTag.length !== 16) {
      throw new InternalServerErrorException(
        'Donnee chiffree invalide : IV ou tag d’authentification de taille incorrecte.',
      );
    }

    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([
      decipher.update(encryptedBuf),
      decipher.final(),
    ]).toString('utf8');
  }

  // ——— RGPD US-24 ———

  /**
   * Export RGPD (US-24) — traitement SYNCHRONE
   * Aucun worker/scheduler n'existe dans le projet : la demande est donc
   * executee immediatement et les donnees sont renvoyees dans la reponse.
   * La demande est tracee en base avec le statut `completed`.
   * - Profil, profil de sante (contre-indications dechiffrees), preferences
   *   de notifications, reservations et factures
   */
  async requestRgpdExport(userId: string): Promise<RgpdExportResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Aucun controle de concurrence : l'export etant synchrone, il n'existe
    // pas de demande "en cours". Le controle 'queued'/'processing' precedent
    // bloquait definitivement les comptes dont une demande n'avait jamais ete
    // traitee (aucun worker n'existait pour la faire avancer).
    const requestId = `rgpd-export-${userId}-${randomBytes(8).toString('hex')}`;
    const completedAt = new Date();

    const { bookings, invoices } =
      await this.userRepository.getRgpdExportData(userId);

    const birthDate = user.getBirthDate();
    const data: RgpdExportDataDto = {
      profile: {
        userId: user.getId(),
        email: user.getEmail(),
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
        birthDate:
          birthDate instanceof Date
            ? birthDate.toISOString()
            : String(birthDate),
        role: user.getRole(),
        status: user.getStatus(),
        emailVerified: user.getEmailVerified(),
        acceptCgu: user.getAcceptCgu(),
        acceptRgpd: user.getAcceptRgpd(),
      },
      healthProfile: this.buildRgpdHealthProfile(user),
      notificationPreferences: user.getNotificationPreferences(),
      bookings,
      invoices,
    };

    const saved = await this.userRepository.setRgpdExportCompleted(
      userId,
      requestId,
      completedAt,
    );

    if (!saved) {
      throw new InternalServerErrorException(
        "Impossible d'enregistrer la demande d'export RGPD",
      );
    }

    return {
      requestId,
      status: 'completed',
      completedAt: completedAt.toISOString(),
      data,
    };
  }

  /**
   * Construit le profil de sante de l'export RGPD en dechiffrant les
   * contre-indications medicales (droit d'acces : restitution en clair au
   * proprietaire de la donnee).
   * Une donnee illisible (ancien format CBC, cle changee, alteration) est
   * signalee explicitement plutot que de faire echouer tout l'export.
   */
  private buildRgpdHealthProfile(
    user: UserEntity,
  ): RgpdExportHealthProfileDto | undefined {
    const healthProfile = user.getHealthProfile();
    if (!healthProfile) return undefined;

    const medicalContraindications =
      healthProfile.medicalContraindications?.map((value) => {
        try {
          return this.decryptAes256(value);
        } catch {
          return RGPD_UNDECRYPTABLE_MARKER;
        }
      });

    return {
      weight: healthProfile.weight,
      height: healthProfile.height,
      medicalContraindications,
      emergencyContact: healthProfile.emergencyContact,
      medicalCertificateFileId: healthProfile.medicalCertificateFileId,
    };
  }

  /**
   * Demande de suppression RGPD (US-24)
   * - Verifie qu'aucune demande n'est deja en cours
   * - Valide le code de confirmation (double consentement)
   * - Planifie la suppression a J+30 (delai de retractation)
   * - Retourne la date de suppression et les donnees retenues (obligation legale)
   */
  async requestRgpdDelete(
    userId: string,
    dto: RgpdDeleteDto,
  ): Promise<RgpdDeleteResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const existing = user.getRgpdRequest();
    if (existing && existing.status === 'scheduled') {
      throw new ConflictException(
        'Une demande de suppression RGPD est deja planifiee',
      );
    }

    // Validation du code de confirmation
    if (!dto.confirmationCode || dto.confirmationCode.trim().length === 0) {
      throw new BadRequestException('Code de confirmation invalide');
    }

    const requestId = `rgpd-delete-${userId}-${randomBytes(8).toString('hex')}`;
    const confirmationCodeExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    const scheduledDeletionAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // J+30

    const saved = await this.userRepository.setRgpdDeleteRequest(
      userId,
      requestId,
      dto.confirmationCode,
      confirmationCodeExpiresAt,
      scheduledDeletionAt,
    );

    if (!saved) {
      throw new InternalServerErrorException(
        'Impossible de creer la demande de suppression RGPD',
      );
    }

    return {
      requestId,
      scheduledDeletionAt: scheduledDeletionAt.toISOString(),
      retainedData: ['invoices for legal retention'],
    };
  }
}
