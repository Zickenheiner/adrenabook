import { Module } from '@nestjs/common';
import { SlotController } from './controllers/slot.controller';
import { SlotService } from './implementation/services/slot.service';
import { SlotRepository } from './implementation/repositories/slot.repository';
import { SlotMapper } from './implementation/mappers/slot.mapper';
import { Slot, SlotSchema } from '@features/slot/domains/schemas/slot.schema';
import {
  Booking,
  BookingSchema,
} from '@features/booking/domains/schemas/booking.schema';
import {
  Activity,
  ActivitySchema,
} from '@features/activity/domains/schemas/activity.schema';
import {
  ProfessionalCenter,
  ProfessionalCenterSchema,
} from '@features/professional/domains/schemas/professional-center.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SlotDetailController } from './controllers/slot-detail.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Slot.name, schema: SlotSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: ProfessionalCenter.name, schema: ProfessionalCenterSchema },
    ]),
  ],
  controllers: [SlotController, SlotDetailController],
  providers: [
    SlotMapper,
    {
      provide: 'ISlotService',
      useClass: SlotService,
    },
    {
      provide: 'ISlotRepository',
      useClass: SlotRepository,
    },
  ],
  exports: ['ISlotService'],
})
export class SlotBaseModule {}
