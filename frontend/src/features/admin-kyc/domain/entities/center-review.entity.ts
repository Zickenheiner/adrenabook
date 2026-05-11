export interface CenterReviewEntity {
  centerId: string;
  newStatus: 'approved' | 'rejected' | 'awaiting_info';
  reviewedAt: Date;
  reviewedBy: string;
  notificationSent: boolean;
}

export interface PendingCenterEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  submittedAt: Date;
  kbisUrl?: string;
  diplomaUrl?: string;
  insuranceUrl?: string;
  description?: string;
}
