import { Injectable } from '@nestjs/common';
import { IPaymentRepository } from '../../../interfaces/repositories/payment.irepository';
import { PaymentMapper } from '../mappers/payment.mapper';
import {
  Payment,
  PaymentDocument,
} from '@features/payment/domains/schemas/payment.schema';
import { Model } from 'mongoose';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
} from '@features/payment/domains/dtos/payment.dto';
import { PaymentEntity } from '@features/payment/domains/entities/payment.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly paymentMapper: PaymentMapper,
  ) {}

  async findAll(): Promise<PaymentEntity[] | null> {
    const payments = await this.paymentModel.find().exec();
    return payments ? payments.map(this.paymentMapper.toEntity) : null;
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const payment = await this.paymentModel.findById(id).exec();
    return payment ? this.paymentMapper.toEntity(payment) : null;
  }

  async create(dto: CreatePaymentDto): Promise<boolean> {
    const document = new this.paymentModel(dto);
    const createdPayment = await document.save();
    return !!createdPayment;
  }

  async update(id: string, dto: UpdatePaymentDto): Promise<boolean> {
    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    return !!updatedPayment;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.paymentModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
