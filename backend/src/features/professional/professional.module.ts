import { Module } from '@nestjs/common';
import { ProfessionalCenterBaseModule } from './modules/professional-center.module';
import { ActivityBaseModule } from '@features/activity/modules/activity.module';
import { ProDashboardModule } from './modules/pro-dashboard.module';
import { CsvImportBaseModule } from './modules/csv-import.module';
import { AccountingExportBaseModule } from './modules/accounting-export.module';

@Module({
  imports: [
    ProfessionalCenterBaseModule,
    ActivityBaseModule,
    ProDashboardModule,
    CsvImportBaseModule,
    AccountingExportBaseModule,
  ],
  exports: [
    ProfessionalCenterBaseModule,
    ActivityBaseModule,
    ProDashboardModule,
    CsvImportBaseModule,
    AccountingExportBaseModule,
  ],
})
export class ProfessionalModule {}
