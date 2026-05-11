import {
  ReviewCenterDto,
  ReviewCenterResponseDto,
} from '@features/admin/domains/dtos/center-review.dto';

export interface ICenterReviewService {
  reviewCenter(
    centerId: string,
    dto: ReviewCenterDto,
    adminId: string,
  ): Promise<ReviewCenterResponseDto>;
}
