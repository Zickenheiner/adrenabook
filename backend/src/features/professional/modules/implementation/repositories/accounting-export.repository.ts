import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { IAccountingExportRepository } from '../../../interfaces/repositories/accounting-export.irepository';
import {
  AccountingExport,
  AccountingExportDocument,
} from '@features/professional/domains/schemas/accounting-export.schema';
import { AccountingExportEntity } from '@features/professional/domains/entities/accounting-export.entity';
import { CreateAccountingExportDto } from '@features/professional/domains/dtos/accounting-export.dto';
import { AccountingExportMapper } from '../mappers/accounting-export.mapper';
import { AccountingRow } from '@features/professional/utils/accounting-csv';

@Injectable()
export class AccountingExportRepository implements IAccountingExportRepository {
  constructor(
    @InjectModel(AccountingExport.name)
    private readonly accountingExportModel: Model<AccountingExportDocument>,
    private readonly accountingExportMapper: AccountingExportMapper,
  ) {}

  async create(
    dto: CreateAccountingExportDto,
    professionalId: string,
  ): Promise<AccountingExportEntity> {
    const document = new this.accountingExportModel({
      format: dto.format,
      from: new Date(dto.from),
      to: new Date(dto.to),
      includeRefunds: dto.includeRefunds,
      deliveryMode: dto.deliveryMode,
      status: 'queued',
      recordsCount: 0,
      professionalId: new mongoose.Types.ObjectId(professionalId),
    });
    const saved = await document.save();
    return this.accountingExportMapper.toEntity(
      saved as AccountingExportDocument,
    );
  }

  async findAccountingRows(
    centerId: string,
    from: Date,
    to: Date,
    includeRefunds: boolean,
  ): Promise<AccountingRow[]> {
    if (!mongoose.Types.ObjectId.isValid(centerId)) return [];

    // Une reservation ne connait que son creneau : le centre se retrouve en
    // remontant le creneau puis l'activite.
    const statuses = includeRefunds
      ? ['confirmed', 'partial_paid', 'cancelled']
      : ['confirmed', 'partial_paid'];

    const docs = await this.accountingExportModel.db
      .collection('bookings')
      .aggregate<{
        _id: mongoose.Types.ObjectId;
        createdAt?: Date;
        status: string;
        totalEur?: number;
        vatEur?: number;
        paidAmountEur?: number;
        refundedAmountEur?: number;
        participants?: { firstName?: string; lastName?: string }[];
        slot?: { startAt?: Date; activityId?: mongoose.Types.ObjectId };
        activity?: { title?: string; centerId?: mongoose.Types.ObjectId };
        customer?: { firstName?: string; lastName?: string; email?: string };
      }>([
        { $match: { status: { $in: statuses } } },
        {
          $lookup: {
            from: 'slots',
            localField: 'slotId',
            foreignField: '_id',
            as: 'slot',
          },
        },
        { $unwind: '$slot' },
        {
          $lookup: {
            from: 'activities',
            localField: 'slot.activityId',
            foreignField: '_id',
            as: 'activity',
          },
        },
        { $unwind: '$activity' },
        {
          $match: {
            'activity.centerId': new mongoose.Types.ObjectId(centerId),
            // La periode porte sur la date du creneau : c'est la prestation
            // rendue qui interesse la comptabilite, pas la date d'achat.
            'slot.startAt': { $gte: from, $lte: to },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'customer',
          },
        },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
        { $sort: { 'slot.startAt': 1 } },
      ])
      .toArray();

    return docs.map((doc) => {
      const participant = doc.participants?.[0];
      const name =
        [doc.customer?.firstName, doc.customer?.lastName]
          .filter(Boolean)
          .join(' ') ||
        [participant?.firstName, participant?.lastName]
          .filter(Boolean)
          .join(' ') ||
        (doc.customer?.email ?? '');

      return {
        bookingId: doc._id.toString(),
        bookingDate: doc.createdAt ?? new Date(0),
        slotDate: doc.slot?.startAt ?? new Date(0),
        activityTitle: doc.activity?.title ?? '',
        customerName: name,
        participants: doc.participants?.length ?? 0,
        status: doc.status,
        totalEur: doc.totalEur ?? 0,
        vatEur: doc.vatEur ?? 0,
        paidEur: doc.paidAmountEur ?? 0,
        refundedEur: doc.refundedAmountEur ?? 0,
      };
    });
  }

  async markReady(
    id: string,
    downloadUrl: string,
    recordsCount: number,
  ): Promise<void> {
    await this.accountingExportModel
      .findByIdAndUpdate(id, { status: 'ready', downloadUrl, recordsCount })
      .exec();
  }

  async findById(id: string): Promise<AccountingExportEntity | null> {
    const doc = await this.accountingExportModel.findById(id).exec();
    return doc ? this.accountingExportMapper.toEntity(doc) : null;
  }
}
