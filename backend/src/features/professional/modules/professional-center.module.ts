import { Module } from '@nestjs/common';
import { ProfessionalCenterController } from './controllers/professional-center.controller';
import { ProfessionalCenterService } from './implementation/services/professional-center.service';
import { ProfessionalCenterRepository } from './implementation/repositories/professional-center.repository';
import { ProfessionalCenterMapper } from './implementation/mappers/professional-center.mapper';
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
  controllers: [ProfessionalCenterController],
  providers: [
    ProfessionalCenterMapper,
    {
      provide: 'IProfessionalCenterService',
      useClass: ProfessionalCenterService,
    },
    {
      provide: 'IProfessionalCenterRepository',
      useClass: ProfessionalCenterRepository,
    },
  ],
  exports: ['IProfessionalCenterService'],
})
export class ProfessionalCenterBaseModule {}
