import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Activity,
  ActivitySchema,
} from '@features/activity/domains/schemas/activity.schema';
import { Slot, SlotSchema } from '@features/slot/domains/schemas/slot.schema';
import {
  Booking,
  BookingSchema,
} from '@features/booking/domains/schemas/booking.schema';
import { ProDashboardController } from './controllers/pro-dashboard.controller';
import { ProDashboardService } from './implementation/services/pro-dashboard.service';
import { ProDashboardRepository } from './implementation/repositories/pro-dashboard.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
      { name: Slot.name, schema: SlotSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [ProDashboardController],
  providers: [
    {
      provide: 'IProDashboardService',
      useClass: ProDashboardService,
    },
    {
      provide: 'IProDashboardRepository',
      useClass: ProDashboardRepository,
    },
  ],
  exports: ['IProDashboardService'],
})
export class ProDashboardModule {}
