export interface ReviewCenterRequestDto {
  decision: 'approve' | 'reject' | 'request_more_info';
  internalComment?: string;
  rejectionReason?:
    | 'incomplete_kbis'
    | 'invalid_diploma'
    | 'expired_insurance'
    | 'other';
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
  submittedAt: string;
  kbisUrl?: string;
  diplomaUrl?: string;
  insuranceUrl?: string;
  description?: string;
}
