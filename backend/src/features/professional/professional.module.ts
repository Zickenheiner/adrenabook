import { Module } from '@nestjs/common';
import { ProfessionalCenterBaseModule } from './modules/professional-center.module';
import { ActivityBaseModule } from '@features/activity/modules/activity.module';

@Module({
  imports: [ProfessionalCenterBaseModule, ActivityBaseModule],
  exports: [ProfessionalCenterBaseModule, ActivityBaseModule],
})
export class ProfessionalModule {}
