import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CenterReview,
  CenterReviewSchema,
} from '@features/admin/domains/schemas/center-review.schema';
import {
  ProfessionalCenter,
  ProfessionalCenterSchema,
} from '@features/professional/domains/schemas/professional-center.schema';
import { CenterReviewController } from './controllers/center-review.controller';
import { CenterReviewService } from './implementation/services/center-review.service';
import { CenterReviewRepository } from './implementation/repositories/center-review.repository';
import { CenterReviewMapper } from './implementation/mappers/center-review.mapper';
import { ProfessionalCenterBaseModule } from '@features/professional/modules/professional-center.module';
import { AuditLogBaseModule } from './audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CenterReview.name, schema: CenterReviewSchema },
      { name: ProfessionalCenter.name, schema: ProfessionalCenterSchema },
    ]),
    ProfessionalCenterBaseModule,
    // Fournit ISensitiveActionLogService pour alimenter le journal US-25.
    AuditLogBaseModule,
  ],
  controllers: [CenterReviewController],
  providers: [
    CenterReviewMapper,
    {
      provide: 'ICenterReviewService',
      useClass: CenterReviewService,
    },
    {
      provide: 'ICenterReviewRepository',
      useClass: CenterReviewRepository,
    },
  ],
  exports: ['ICenterReviewService'],
})
export class AdminBaseModule {}
