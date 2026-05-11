import { Module } from '@nestjs/common';
import { ProfessionalCenterBaseModule } from './modules/professional-center.module';

@Module({
  imports: [ProfessionalCenterBaseModule],
  exports: [ProfessionalCenterBaseModule],
})
export class ProfessionalModule {}
