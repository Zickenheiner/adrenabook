import { Module } from '@nestjs/common';
import { CenterController } from './controllers/center.controller';
import { CenterService } from './implementation/services/center.service';
import { CenterRepository } from './implementation/repositories/center.repository';
import {
  ProfessionalCenter,
  ProfessionalCenterSchema,
} from '@features/professional/domains/schemas/professional-center.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProfessionalCenter.name, schema: ProfessionalCenterSchema },
    ]),
  ],
  controllers: [CenterController],
  providers: [
    {
      provide: 'ICenterService',
      useClass: CenterService,
    },
    {
      provide: 'ICenterRepository',
      useClass: CenterRepository,
    },
  ],
  exports: ['ICenterService'],
})
export class CenterBaseModule {}
