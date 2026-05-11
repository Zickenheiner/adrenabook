import { Module } from '@nestjs/common';
import { BookingController } from './controllers/booking.controller';
import { BookingService } from './implementation/services/booking.service';
import { BookingRepository } from './implementation/repositories/booking.repository';
import { BookingMapper } from './implementation/mappers/booking.mapper';
import {
  Booking,
  BookingSchema,
} from '@features/booking/domains/schemas/booking.schema';
import { Slot, SlotSchema } from '@features/slot/domains/schemas/slot.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Slot.name, schema: SlotSchema },
    ]),
  ],
  controllers: [BookingController],
  providers: [
    BookingMapper,
    {
      provide: 'IBookingService',
      useClass: BookingService,
    },
    {
      provide: 'IBookingRepository',
      useClass: BookingRepository,
    },
  ],
  exports: ['IBookingService'],
})
export class BookingBaseModule {}
