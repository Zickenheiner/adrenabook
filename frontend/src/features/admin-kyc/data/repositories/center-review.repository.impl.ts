import type { CenterReviewRepository } from '../../domain/repositories/center-review.repository';
import type {
  CenterReviewEntity,
  PendingCenterEntity,
} from '../../domain/entities/center-review.entity';
import type { ReviewCenterRequestDto } from '../dtos/center-review.dto';
import CenterReviewApi from '../datasources/center-review.api';
import CenterReviewMapper from '../mappers/center-review.mapper';

class CenterReviewRepositoryImpl implements CenterReviewRepository {
  constructor(
    private readonly api: CenterReviewApi = new CenterReviewApi(),
    private readonly mapper: CenterReviewMapper = new CenterReviewMapper(),
  ) {}

  async getPendingCenters(): Promise<PendingCenterEntity[]> {
    const dtos = await this.api.getPendingCenters();
    return this.mapper.toPendingCenterEntityList(dtos);
  }

  async reviewCenter(
    id: string,
    data: ReviewCenterRequestDto,
  ): Promise<CenterReviewEntity> {
    const dto = await this.api.reviewCenter(id, data);
    return this.mapper.toEntity(dto);
  }
}

export default CenterReviewRepositoryImpl;
