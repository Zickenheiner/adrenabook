import { Module, forwardRef } from '@nestjs/common';
import { InvoiceController } from './controllers/invoice.controller';
import { InvoiceService } from './implementation/services/invoice.service';
import { InvoiceRepository } from './implementation/repositories/invoice.repository';
import { InvoiceMapper } from './implementation/mappers/invoice.mapper';
import {
  Invoice,
  InvoiceSchema,
} from '@features/invoice/domains/schemas/invoice.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingBaseModule } from '@features/booking/modules/booking.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    forwardRef(() => BookingBaseModule),
  ],
  controllers: [InvoiceController],
  providers: [
    InvoiceMapper,
    {
      provide: 'IInvoiceService',
      useClass: InvoiceService,
    },
    {
      provide: 'IInvoiceRepository',
      useClass: InvoiceRepository,
    },
  ],
  exports: ['IInvoiceService'],
})
export class InvoiceBaseModule {}
