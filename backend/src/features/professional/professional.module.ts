import { Module } from '@nestjs/common';
import { ProfessionalCenterBaseModule } from './modules/professional-center.module';
import { ActivityBaseModule } from '@features/activity/modules/activity.module';
import { ProDashboardModule } from './modules/pro-dashboard.module';
import { CsvImportBaseModule } from './modules/csv-import.module';

@Module({
  imports: [
    ProfessionalCenterBaseModule,
    ActivityBaseModule,
    ProDashboardModule,
    CsvImportBaseModule,
  ],
  exports: [
    ProfessionalCenterBaseModule,
    ActivityBaseModule,
    ProDashboardModule,
    CsvImportBaseModule,
  ],
})
export class ProfessionalModule {}
