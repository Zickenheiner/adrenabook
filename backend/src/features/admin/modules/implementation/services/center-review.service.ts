import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICenterReviewService } from '../../../interfaces/services/center-review.iservice';
import { ICenterReviewRepository } from '@features/admin/interfaces/repositories/center-review.irepository';
import {
  ReviewCenterDto,
  ReviewCenterResponseDto,
} from '@features/admin/domains/dtos/center-review.dto';
import { IProfessionalCenterService } from '@features/professional/interfaces/services/professional-center.iservice';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ProfessionalCenter,
  ProfessionalCenterDocument,
} from '@features/professional/domains/schemas/professional-center.schema';
import mongoose from 'mongoose';

const DECISION_TO_STATUS: Record<
  'approve' | 'reject' | 'request_more_info',
  'approved' | 'rejected' | 'awaiting_info'
> = {
  approve: 'approved',
  reject: 'rejected',
  request_more_info: 'awaiting_info',
};

@Injectable()
export class CenterReviewService implements ICenterReviewService {
  constructor(
    @Inject('ICenterReviewRepository')
    private readonly centerReviewRepository: ICenterReviewRepository,
    @Inject('IProfessionalCenterService')
    private readonly professionalCenterService: IProfessionalCenterService,
    @InjectModel(ProfessionalCenter.name)
    private readonly professionalCenterModel: Model<ProfessionalCenterDocument>,
  ) {}

  async reviewCenter(
    centerId: string,
    dto: ReviewCenterDto,
    adminId: string,
  ): Promise<ReviewCenterResponseDto> {
    const center = await this.professionalCenterService.findById(centerId);
    if (!center) {
      throw new NotFoundException(`Center with id ${centerId} not found`);
    }

    if (center.getStatus() !== 'pending_review') {
      throw new ConflictException(
        `Center dossier has already been processed (status: ${center.getStatus()})`,
      );
    }

    const reviewData = {
      ...dto,
      centerId: new mongoose.Types.ObjectId(centerId),
      reviewedBy: new mongoose.Types.ObjectId(adminId),
      notificationSent: false,
    };

    const reviewEntity = await this.centerReviewRepository.create(
      reviewData as unknown as ReviewCenterDto,
    );

    const newStatus = DECISION_TO_STATUS[dto.decision];

    await this.professionalCenterModel
      .findByIdAndUpdate(centerId, { status: newStatus }, { new: true })
      .exec();

    return {
      centerId,
      newStatus,
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminId,
      notificationSent: reviewEntity.getNotificationSent(),
    };
  }
}
