import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AccountingExport,
  AccountingExportSchema,
} from '@features/professional/domains/schemas/accounting-export.schema';
import { AccountingExportController } from './controllers/accounting-export.controller';
import { AccountingExportService } from './implementation/services/accounting-export.service';
import { AccountingExportRepository } from './implementation/repositories/accounting-export.repository';
import { AccountingExportMapper } from './implementation/mappers/accounting-export.mapper';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountingExport.name, schema: AccountingExportSchema },
    ]),
  ],
  controllers: [AccountingExportController],
  providers: [
    AccountingExportMapper,
    {
      provide: 'IAccountingExportService',
      useClass: AccountingExportService,
    },
    {
      provide: 'IAccountingExportRepository',
      useClass: AccountingExportRepository,
    },
  ],
  exports: ['IAccountingExportService'],
})
export class AccountingExportBaseModule {}
