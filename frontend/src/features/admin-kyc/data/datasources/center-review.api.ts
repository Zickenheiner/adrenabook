import endpoints from '@/core/constants/endpoints';
import request from '@/core/config/api';
import methods from '@/core/constants/methods';
import type {
  ReviewCenterRequestDto,
  ReviewCenterResponseDto,
  PendingCenterDto,
} from '../dtos/center-review.dto';

class CenterReviewApi {
  constructor(private readonly baseUrl: string = endpoints.adminCenters.list) {}

  async getPendingCenters(): Promise<PendingCenterDto[]> {
    return request<PendingCenterDto[]>({
      url: this.baseUrl,
      method: methods.GET,
      // La page ne présente que les dossiers à instruire : sans ce filtre,
      // l'API renvoie tous les centres, y compris ceux déjà validés.
      query: { status: 'pending_review' },
    });
  }

  async reviewCenter(
    id: string,
    data: ReviewCenterRequestDto,
  ): Promise<ReviewCenterResponseDto> {
    return request<ReviewCenterResponseDto>({
      url: endpoints.adminCenters.review(id),
      method: methods.POST,
      data,
    });
  }
}

export default CenterReviewApi;
