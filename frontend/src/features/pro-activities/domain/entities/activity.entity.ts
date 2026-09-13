/**
 * Une activite est publiee ou elle ne l'est pas : rien d'autre. Non publiee,
 * elle reste invisible du public et non reservable.
 */
export type ActivityStatus = 'unpublished' | 'published';
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
  priceEur: number;
  prerequisites: ActivityPrerequisitesEntity;
  includedEquipment: string[];
  photoFileIds: string[];
  status: ActivityStatus;
  createdAt: Date;
  updatedAt: Date;
}
