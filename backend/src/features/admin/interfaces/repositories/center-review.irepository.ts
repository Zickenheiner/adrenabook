import { ReviewCenterDto } from '@features/admin/domains/dtos/center-review.dto';
import { CenterReviewEntity } from '@features/admin/domains/entities/center-review.entity';
import { PendingCenterDto } from '@features/admin/domains/dtos/center-review.dto';

export interface ICenterReviewRepository {
  findAll(): Promise<CenterReviewEntity[] | null>;
  /** Dossiers de centres professionnels, du plus recent au plus ancien. */
  findCenters(status?: string): Promise<PendingCenterDto[]>;
  findCenterById(id: string): Promise<PendingCenterDto | null>;
  findById(id: string): Promise<CenterReviewEntity | null>;
  create(dto: ReviewCenterDto): Promise<CenterReviewEntity>;
  delete(id: string): Promise<boolean>;
}
