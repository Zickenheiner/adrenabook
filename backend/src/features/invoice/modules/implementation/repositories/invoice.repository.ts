import { Injectable } from '@nestjs/common';
import { IInvoiceRepository } from '../../../interfaces/repositories/invoice.irepository';
import { InvoiceMapper } from '../mappers/invoice.mapper';
import {
  Invoice,
  InvoiceDocument,
} from '@features/invoice/domains/schemas/invoice.schema';
import { Model } from 'mongoose';
import { CreateInvoiceDto } from '@features/invoice/domains/dtos/invoice.dto';
import { InvoiceEntity } from '@features/invoice/domains/entities/invoice.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Injectable()
export class InvoiceRepository implements IInvoiceRepository {
  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    private readonly invoiceMapper: InvoiceMapper,
  ) {}

  async findByBookingId(bookingId: string): Promise<InvoiceEntity | null> {
    const invoice = await this.invoiceModel
      .findOne({ bookingId: new mongoose.Types.ObjectId(bookingId) })
      .exec();
    return invoice ? this.invoiceMapper.toEntity(invoice) : null;
  }

  async create(dto: CreateInvoiceDto): Promise<InvoiceEntity | null> {
    const document = new this.invoiceModel({
      bookingId: new mongoose.Types.ObjectId(dto.bookingId),
      userId: new mongoose.Types.ObjectId(dto.userId),
      invoiceNumber: dto.invoiceNumber,
      issuedAt: new Date(dto.issuedAt),
      totalEur: dto.totalEur,
      vatEur: dto.vatEur,
    });
    const saved = await document.save();
    return saved ? this.invoiceMapper.toEntity(saved as InvoiceDocument) : null;
  }

  async getNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.invoiceModel.countDocuments().exec();
    const sequence = String(count + 1).padStart(6, '0');
    return `INV-${year}-${sequence}`;
  }
}
