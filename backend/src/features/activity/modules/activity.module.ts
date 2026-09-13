import { Module } from '@nestjs/common';
import { ActivityController } from './controllers/activity.controller';
import { ActivitySearchController } from './controllers/activity-search.controller';
import { ActivityService } from './implementation/services/activity.service';
import { ActivityRepository } from './implementation/repositories/activity.repository';
import { ActivityMapper } from './implementation/mappers/activity.mapper';
import {
  Activity,
  ActivitySchema,
} from '@features/activity/domains/schemas/activity.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Slot, SlotSchema } from '@features/slot/domains/schemas/slot.schema';
import { UploadModule } from '@features/uploads/modules/upload.module';
import { ProfessionalCenterBaseModule } from '@features/professional/modules/professional-center.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
      { name: Slot.name, schema: SlotSchema },
    ]),
    ProfessionalCenterBaseModule,
    // Fournit IUploadService pour servir les photos publiques des activites.
    UploadModule,
  ],
  controllers: [ActivityController, ActivitySearchController],
  providers: [
    ActivityMapper,
    {
      provide: 'IActivityService',
      useClass: ActivityService,
    },
    {
      provide: 'IActivityRepository',
      useClass: ActivityRepository,
    },
  ],
  exports: ['IActivityService'],
})
export class ActivityBaseModule {}
