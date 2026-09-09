import {
  PendingCenterDto,
  ReviewCenterDto,
  ReviewCenterResponseDto,
} from '@features/admin/domains/dtos/center-review.dto';

export interface ICenterReviewService {
  reviewCenter(
    centerId: string,
    dto: ReviewCenterDto,
    adminId: string,
    adminRole: string,
  ): Promise<ReviewCenterResponseDto>;

  /** Liste des dossiers de centres, filtrable par statut (US-23). */
  listCenters(status?: string): Promise<PendingCenterDto[]>;

  /** Dossier d'un centre. Leve NotFoundException s'il n'existe pas. */
  getCenter(id: string): Promise<PendingCenterDto>;
}
