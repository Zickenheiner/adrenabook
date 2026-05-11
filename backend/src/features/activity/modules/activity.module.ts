import { Module } from '@nestjs/common';
import { ActivityController } from './controllers/activity.controller';
import { ActivityService } from './implementation/services/activity.service';
import { ActivityRepository } from './implementation/repositories/activity.repository';
import { ActivityMapper } from './implementation/mappers/activity.mapper';
import {
  Activity,
  ActivitySchema,
} from '@features/activity/domains/schemas/activity.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
    ]),
  ],
  controllers: [ActivityController],
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
