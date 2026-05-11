import type {
  CenterReviewEntity,
  PendingCenterEntity,
} from '../entities/center-review.entity';
import type { ReviewCenterRequestDto } from '../../data/dtos/center-review.dto';

export interface CenterReviewRepository {
  getPendingCenters(): Promise<PendingCenterEntity[]>;
  reviewCenter(
    id: string,
    data: ReviewCenterRequestDto,
  ): Promise<CenterReviewEntity>;
}
