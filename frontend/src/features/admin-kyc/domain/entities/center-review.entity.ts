export interface CenterReviewEntity {
  centerId: string;
  newStatus: 'approved' | 'rejected' | 'awaiting_info';
  reviewedAt: Date;
  reviewedBy: string;
  notificationSent: boolean;
}

export interface CenterDocumentRef {
  label: string;
  fileId: string;
}

export interface PendingCenterEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  siret: string;
  city: string;
  status: 'pending_review' | 'approved' | 'rejected';
  submittedAt: Date;
  documents: CenterDocumentRef[];
}
