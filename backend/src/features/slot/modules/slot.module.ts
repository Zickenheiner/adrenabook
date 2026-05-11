import { Module } from '@nestjs/common';
import { SlotController } from './controllers/slot.controller';
import { SlotService } from './implementation/services/slot.service';
import { SlotRepository } from './implementation/repositories/slot.repository';
import { SlotMapper } from './implementation/mappers/slot.mapper';
import { Slot, SlotSchema } from '@features/slot/domains/schemas/slot.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Slot.name, schema: SlotSchema }]),
  ],
  controllers: [SlotController],
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
