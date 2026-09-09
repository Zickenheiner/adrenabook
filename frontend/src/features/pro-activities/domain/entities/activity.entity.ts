export type ActivityStatus =
  'draft' | 'pending_admin_review' | 'published' | 'archived';
export type ActivityDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ActivityPrerequisitesEntity {
  minAge: number;
  maxAge?: number;
  minWeightKg?: number;
  maxWeightKg?: number;
  medicalCertificateRequired: boolean;
}

export interface ActivityEntity {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: ActivityDifficulty;
  durationMinutes: number;
  priceFromEur: number;
  prerequisites: ActivityPrerequisitesEntity;
  includedEquipment: string[];
  photoFileIds: string[];
  status: ActivityStatus;
  createdAt: Date;
  updatedAt: Date;
}
