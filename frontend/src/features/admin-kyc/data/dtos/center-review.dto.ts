export interface ReviewCenterRequestDto {
  decision: 'approve' | 'reject' | 'request_more_info';
  internalComment?: string;
  rejectionReason?:
    'incomplete_kbis' | 'invalid_diploma' | 'expired_insurance' | 'other';
  publicComment?: string;
}

export interface ReviewCenterResponseDto {
  centerId: string;
  newStatus: 'approved' | 'rejected' | 'awaiting_info';
  reviewedAt: string;
  reviewedBy: string;
  notificationSent: boolean;
}

export interface PendingCenterDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  siret: string;
  city: string;
  status: 'pending_review' | 'approved' | 'rejected';
  submittedAt: string;
  // Les pieces sont identifiees, pas exposees par URL publique : elles se
  // recuperent via GET /uploads/:id, qui controle le droit d'acces.
  kbisFileId?: string;
  rcProFileId?: string;
  instructorDiplomaFileIds?: string[];
}
