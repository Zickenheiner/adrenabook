import { Module, forwardRef } from '@nestjs/common';
import { InvoiceService } from './implementation/services/invoice.service';
import { InvoiceRepository } from './implementation/repositories/invoice.repository';
import { InvoiceMapper } from './implementation/mappers/invoice.mapper';
import {
  Invoice,
  InvoiceSchema,
} from '@features/invoice/domains/schemas/invoice.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingBaseModule } from '@features/booking/modules/booking.module';

// Aucun controller ici : la seule route de facture est exposee par
// BookingController (GET /bookings/:id/invoice), qui injecte IInvoiceService.
import { UserBaseModule } from '@features/auth/modules/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    forwardRef(() => BookingBaseModule),
    // Fournit IUserRepository : la facture nomme son destinataire.
    UserBaseModule,
  ],
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
