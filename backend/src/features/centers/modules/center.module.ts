import { Module } from '@nestjs/common';
import { CenterController } from './controllers/center.controller';
import { CenterService } from './implementation/services/center.service';
import { CenterRepository } from './implementation/repositories/center.repository';
import { CenterMapper } from './implementation/mappers/center.mapper';
import {
  Center,
  CenterSchema,
} from '@features/centers/domains/schemas/center.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Center.name, schema: CenterSchema }]),
  ],
  controllers: [CenterController],
  providers: [
    CenterMapper,
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
