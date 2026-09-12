import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../interfaces/repositories/user.irepository';
import { UserMapper } from '../mappers/user.mapper';
import { User, UserDocument } from '@features/auth/domains/schemas/user.schema';
import { Model, PipelineStage, Types } from 'mongoose';
import {
  ActivitySummaryDto,
  BookingSummaryDto,
  CreateUserDto,
  DashboardResponseDto,
  HealthProfileDto,
  NotificationPreferencesDto,
  RegisterDto,
  RgpdExportBookingDto,
  RgpdExportInvoiceDto,
  UpdateUserDto,
} from '@features/auth/domains/dtos/user.dto';
import { UserEntity } from '@features/auth/domains/entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  Booking,
  BookingDocument,
} from '@features/booking/domains/schemas/booking.schema';
import {
  Activity,
  ActivityDocument,
} from '@features/activity/domains/schemas/activity.schema';
import {
  Invoice,
  InvoiceDocument,
} from '@features/invoice/domains/schemas/invoice.schema';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    private readonly userMapper: UserMapper,
  ) {}

  async findAll(): Promise<UserEntity[] | null> {
    const users = await this.userModel.find().exec();
    return users ? users.map((doc) => this.userMapper.toEntity(doc)) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? this.userMapper.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .exec();
    return user ? this.userMapper.toEntity(user) : null;
  }

  async register(
    dto: RegisterDto,
    hashedPassword: string,
    emailVerificationToken: string,
  ): Promise<UserEntity | null> {
    const document = new this.userModel({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      birthDate: new Date(dto.birthDate),
      acceptCgu: dto.acceptCgu,
      acceptRgpd: dto.acceptRgpd,
      emailVerified: false,
      emailVerificationToken,
      role: 'aventurier',
      failedLoginAttempts: 0,
      twoFactorEnabled: false,
    });
    const created = await document.save();
    return created ? this.userMapper.toEntity(created) : null;
  }

  async create(dto: CreateUserDto): Promise<boolean> {
    const document = new this.userModel(dto);
    const createdUser = await document.save();
    return !!createdUser;
  }

  async update(id: string, dto: UpdateUserDto): Promise<boolean> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    return !!updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  // ——— Securite US-02 ———

  async incrementFailedAttempts(id: string): Promise<UserEntity | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        { $inc: { failedLoginAttempts: 1 } },
        { new: true },
      )
      .exec();
    return updated ? this.userMapper.toEntity(updated) : null;
  }

  async lockAccount(id: string, lockedUntil: Date): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, { lockedUntil }, { new: true })
      .exec();
    return !!updated;
  }

  async resetFailedAttempts(id: string): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        { failedLoginAttempts: 0, $unset: { lockedUntil: '' } },
        { new: true },
      )
      .exec();
    return !!updated;
  }

  async setTwoFactorCode(
    id: string,
    code: string,
    expiresAt: Date,
  ): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        { twoFactorCode: code, twoFactorCodeExpiresAt: expiresAt },
        { new: true },
      )
      .exec();
    return !!updated;
  }

  async clearTwoFactorCode(id: string): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        { $unset: { twoFactorCode: '', twoFactorCodeExpiresAt: '' } },
        { new: true },
      )
      .exec();
    return !!updated;
  }

  async setRefreshTokenHash(id: string, hash: string): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, { refreshTokenHash: hash }, { new: true })
      .exec();
    return !!updated;
  }

  // ——— Reinitialisation mot de passe US-03 ———

  async setPasswordResetToken(
    id: string,
    hashedToken: string,
    expiresAt: Date,
  ): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          passwordResetTokenHash: hashedToken,
          passwordResetTokenExpiresAt: expiresAt,
        },
        { new: true },
      )
      .exec();
    return !!updated;
  }

  async clearPasswordResetToken(id: string): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          $unset: {
            passwordResetTokenHash: '',
            passwordResetTokenExpiresAt: '',
          },
        },
        { new: true },
      )
      .exec();
    return !!updated;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, { password: hashedPassword }, { new: true })
      .exec();
    return !!updated;
  }

  async clearRefreshTokenHash(id: string): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        { $unset: { refreshTokenHash: '' } },
        { new: true },
      )
      .exec();
    return !!updated;
  }

  // ——— Statut admin US-22 ———

  async updateStatus(id: string, status: string): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    return !!updated;
  }

  async updateRole(id: string, role: string): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, { role }, { new: true })
      .exec();
    return !!updated;
  }

  // ——— RGPD US-24 ———

  /**
   * Trace une demande d'export RGPD deja executee (traitement synchrone).
   * Il n'existe pas de worker asynchrone : la demande est donc directement
   * enregistree avec le statut `completed`.
   */
  async setRgpdExportCompleted(
    id: string,
    requestId: string,
    completedAt: Date,
  ): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          rgpdRequest: {
            requestId,
            requestType: 'export',
            status: 'completed',
            requestedAt: new Date(),
            completedAt,
          },
        },
        { new: true },
      )
      .exec();
    return !!updated;
  }

  /**
   * Collecte les donnees personnelles de l'utilisateur pour l'export RGPD.
   * Les contre-indications medicales restent chiffrees ici : le dechiffrement
   * est fait par le service (detenteur de la cle).
   */
  async getRgpdExportData(id: string): Promise<{
    bookings: RgpdExportBookingDto[];
    invoices: RgpdExportInvoiceDto[];
  }> {
    let userObjectId: Types.ObjectId;
    try {
      userObjectId = new Types.ObjectId(id);
    } catch {
      return { bookings: [], invoices: [] };
    }

    const [bookingDocs, invoiceDocs] = await Promise.all([
      this.bookingModel
        .find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      this.invoiceModel
        .find({ userId: userObjectId })
        .sort({ issuedAt: -1 })
        .lean()
        .exec(),
    ]);

    const bookings: RgpdExportBookingDto[] = bookingDocs.map((doc) => ({
      bookingId: String(doc._id),
      slotId: String(doc.slotId),
      status: doc.status,
      totalEur: doc.totalEur,
      vatEur: doc.vatEur,
      participantsCount: doc.participants?.length ?? 0,
      createdAt: (doc as { createdAt?: Date }).createdAt?.toISOString(),
    }));

    const invoices: RgpdExportInvoiceDto[] = invoiceDocs.map((doc) => ({
      invoiceId: String(doc._id),
      invoiceNumber: doc.invoiceNumber,
      bookingId: String(doc.bookingId),
      issuedAt:
        doc.issuedAt instanceof Date
          ? doc.issuedAt.toISOString()
          : String(doc.issuedAt),
      totalEur: doc.totalEur,
      vatEur: doc.vatEur,
    }));

    return { bookings, invoices };
  }

  async setRgpdDeleteRequest(
    id: string,
    requestId: string,
    confirmationCode: string,
    confirmationCodeExpiresAt: Date,
    scheduledDeletionAt: Date,
  ): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          rgpdRequest: {
            requestId,
            requestType: 'delete',
            status: 'scheduled',
            requestedAt: new Date(),
            scheduledDeletionAt,
            confirmationCode,
            confirmationCodeExpiresAt,
          },
        },
        { new: true },
      )
      .exec();
    return !!updated;
  }

  async getRgpdRequest(id: string): Promise<UserEntity | null> {
    return this.findById(id);
  }

  // ——— Preferences de notifications US-14 ———

  async updateNotificationPreferences(
    id: string,
    dto: NotificationPreferencesDto,
  ): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, { notificationPreferences: dto }, { new: true })
      .exec();
    return !!updated;
  }

  // ——— Profil de sante US-05 ———

  async updateHealthProfile(
    id: string,
    dto: HealthProfileDto,
    encryptedContraindications: string[] | undefined,
  ): Promise<boolean> {
    const healthProfile = {
      weight: dto.weight,
      height: dto.height,
      medicalContraindications: encryptedContraindications,
      emergencyContact: dto.emergencyContact,
      medicalCertificateFileId: dto.medicalCertificateFileId,
    };
    const updated = await this.userModel
      .findByIdAndUpdate(id, { healthProfile }, { new: true })
      .exec();
    return !!updated;
  }

  // ——— Dashboard aventurier US-29 ———

  async getDashboard(userId: string): Promise<DashboardResponseDto> {
    let userObjectId: Types.ObjectId;
    try {
      userObjectId = new Types.ObjectId(userId);
    } catch {
      return { firstName: '', upcomingBookings: [], suggestedActivities: [] };
    }

    const now = new Date();

    // Récupère les 3 prochaines réservations confirmées ou partiellement payées
    // en joignant le slot puis l'activité via le slotId → activityId
    const bookingPipeline: PipelineStage[] = [
      {
        $match: {
          userId: userObjectId,
          status: { $in: ['confirmed', 'partial_paid'] },
        },
      },
      {
        $lookup: {
          from: 'slots',
          localField: 'slotId',
          foreignField: '_id',
          as: 'slotArray',
        },
      },
      { $unwind: { path: '$slotArray', preserveNullAndEmptyArrays: false } },
      { $match: { 'slotArray.startAt': { $gte: now } } },
      { $sort: { 'slotArray.startAt': 1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: 'activities',
          localField: 'slotArray.activityId',
          foreignField: '_id',
          as: 'activityArray',
        },
      },
      {
        $addFields: {
          activity: { $arrayElemAt: ['$activityArray', 0] },
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          slotStartAt: '$slotArray.startAt',
          activityTitle: '$activity.title',
        },
      },
    ];

    interface BookingAggResult {
      _id: Types.ObjectId;
      status: string;
      slotStartAt: Date;
      activityTitle: string;
    }

    const bookingDocs =
      await this.bookingModel.aggregate<BookingAggResult>(bookingPipeline);

    const upcomingBookings: BookingSummaryDto[] = bookingDocs.map((doc) => ({
      bookingId: doc._id.toString(),
      activityTitle: doc.activityTitle ?? '',
      slotStartAt:
        doc.slotStartAt instanceof Date
          ? doc.slotStartAt.toISOString()
          : String(doc.slotStartAt),
      status: doc.status,
    }));

    // Récupère les types d'activités déjà réservées pour la personnalisation
    const bookedTypes = await this.bookingModel
      .aggregate<{ type: string }>([
        { $match: { userId: userObjectId } },
        {
          $lookup: {
            from: 'slots',
            localField: 'slotId',
            foreignField: '_id',
            as: 'slotArray',
          },
        },
        { $unwind: { path: '$slotArray', preserveNullAndEmptyArrays: false } },
        {
          $lookup: {
            from: 'activities',
            localField: 'slotArray.activityId',
            foreignField: '_id',
            as: 'activityArray',
          },
        },
        {
          $unwind: {
            path: '$activityArray',
            preserveNullAndEmptyArrays: false,
          },
        },
        { $group: { _id: '$activityArray.type' } },
        { $project: { type: '$_id', _id: 0 } },
      ])
      .exec();

    const preferredTypes = bookedTypes.map((r) => r.type);

    // Récupère 4 activités suggérées : préférence pour les types déjà pratiqués,
    // sinon aléatoire parmi les activités publiées
    interface ActivityAggResult {
      _id: Types.ObjectId;
      title: string;
      type: string;
      priceFromEur: number;
      difficulty: string;
      coverPhotoUrl: string;
    }

    let suggestedDocs: ActivityAggResult[] = [];

    if (preferredTypes.length > 0) {
      // D'abord essayer les types préférés
      const preferredPipeline: PipelineStage[] = [
        {
          $match: {
            status: 'published',
            type: { $in: preferredTypes },
          },
        },
        { $sample: { size: 4 } },
        {
          $project: {
            _id: 1,
            title: 1,
            type: 1,
            priceFromEur: 1,
            difficulty: 1,
            coverPhotoUrl: { $arrayElemAt: ['$photoFileIds', 0] },
          },
        },
      ];
      suggestedDocs =
        await this.activityModel.aggregate<ActivityAggResult>(
          preferredPipeline,
        );
    }

    if (suggestedDocs.length < 4) {
      // Compléter avec des activités aléatoires
      const remaining = 4 - suggestedDocs.length;
      const alreadyIds = suggestedDocs.map((d) => d._id);
      const randomPipeline: PipelineStage[] = [
        {
          $match: {
            status: 'published',
            _id: { $nin: alreadyIds },
          },
        },
        { $sample: { size: remaining } },
        {
          $project: {
            _id: 1,
            title: 1,
            type: 1,
            priceFromEur: 1,
            difficulty: 1,
            coverPhotoUrl: { $arrayElemAt: ['$photoFileIds', 0] },
          },
        },
      ];
      const randomDocs =
        await this.activityModel.aggregate<ActivityAggResult>(randomPipeline);
      suggestedDocs = [...suggestedDocs, ...randomDocs];
    }

    const suggestedActivities: ActivitySummaryDto[] = suggestedDocs.map(
      (doc) => ({
        activityId: doc._id.toString(),
        title: doc.title,
        type: doc.type,
        priceFromEur: doc.priceFromEur,
        difficulty: doc.difficulty,
        coverPhotoUrl: doc.coverPhotoUrl ?? '',
      }),
    );

    const userDoc = await this.userModel
      .findById(userObjectId)
      .select('firstName')
      .lean()
      .exec();
    const firstName = (userDoc as { firstName?: string })?.firstName ?? '';

    return { firstName, upcomingBookings, suggestedActivities };
  }
}
