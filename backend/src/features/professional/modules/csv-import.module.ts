import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CsvImport,
  CsvImportSchema,
} from '@features/professional/domains/schemas/csv-import.schema';
import { CsvImportController } from './controllers/csv-import.controller';
import { CsvImportService } from './implementation/services/csv-import.service';
import { CsvImportRepository } from './implementation/repositories/csv-import.repository';
import { CsvImportMapper } from './implementation/mappers/csv-import.mapper';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CsvImport.name, schema: CsvImportSchema },
    ]),
  ],
  controllers: [CsvImportController],
  providers: [
    CsvImportMapper,
    {
      provide: 'ICsvImportService',
      useClass: CsvImportService,
    },
    {
      provide: 'ICsvImportRepository',
      useClass: CsvImportRepository,
    },
  ],
  exports: ['ICsvImportService'],
})
export class CsvImportBaseModule {}
