export interface ActivityPrerequisitesDto {
  minAge: number;
  maxAge?: number;
  minWeightKg?: number;
  maxWeightKg?: number;
  medicalCertificateRequired: boolean;
}

export interface CreateActivityRequestDto {
  title: string;
  description: string;
  type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  priceFromEur: number;
  prerequisites: ActivityPrerequisitesDto;
  includedEquipment: string[];
  photoFileIds: string[];
  status: 'draft' | 'published';
}

/**
 * A la difference de la creation, la mise a jour accepte `archived`.
 * `pending_admin_review` reste pose par le systeme et n'est jamais envoye.
 */
export type UpdateActivityRequestDto = Omit<
  CreateActivityRequestDto,
  'status'
> & {
  status?: 'draft' | 'published' | 'archived';
};

export interface ActivityResponseDto {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  priceFromEur: number;
  prerequisites: ActivityPrerequisitesDto;
  includedEquipment: string[];
  photoFileIds: string[];
  status: 'draft' | 'pending_admin_review' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}
