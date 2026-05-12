import { Module } from '@nestjs/common';
import { ProfessionalCenterBaseModule } from './modules/professional-center.module';
import { ActivityBaseModule } from '@features/activity/modules/activity.module';
import { ProDashboardModule } from './modules/pro-dashboard.module';

@Module({
  imports: [
    ProfessionalCenterBaseModule,
    ActivityBaseModule,
    ProDashboardModule,
  ],
  exports: [
    ProfessionalCenterBaseModule,
    ActivityBaseModule,
    ProDashboardModule,
  ],
})
export class ProfessionalModule {}
