import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Waiver,
  WaiverSchema,
} from '@features/waiver/domains/schemas/waiver.schema';
import {
  Booking,
  BookingSchema,
} from '@features/booking/domains/schemas/booking.schema';
import { WaiverController } from './controllers/waiver.controller';
import { WaiverService } from './implementation/services/waiver.service';
import { WaiverRepository } from './implementation/repositories/waiver.repository';
import { WaiverMapper } from './implementation/mappers/waiver.mapper';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Waiver.name, schema: WaiverSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [WaiverController],
  providers: [
    WaiverMapper,
    {
      provide: 'IWaiverService',
      useClass: WaiverService,
    },
    {
      provide: 'IWaiverRepository',
      useClass: WaiverRepository,
    },
  ],
  exports: ['IWaiverService'],
})
export class WaiverBaseModule {}
