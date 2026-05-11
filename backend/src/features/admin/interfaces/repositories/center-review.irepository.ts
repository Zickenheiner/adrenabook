import { ReviewCenterDto } from '@features/admin/domains/dtos/center-review.dto';
import { CenterReviewEntity } from '@features/admin/domains/entities/center-review.entity';

export interface ICenterReviewRepository {
  findAll(): Promise<CenterReviewEntity[] | null>;
  findById(id: string): Promise<CenterReviewEntity | null>;
  create(dto: ReviewCenterDto): Promise<CenterReviewEntity>;
  delete(id: string): Promise<boolean>;
}
