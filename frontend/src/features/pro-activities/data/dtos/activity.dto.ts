import type { ActivityStatus } from '../../domain/entities/activity.entity';

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
  priceEur: number;
  prerequisites: ActivityPrerequisitesDto;
  includedEquipment: string[];
  photoFileIds: string[];
}

/**
 * Le statut n'existe pas a la creation : l'activite naît non publiee et sa
 * mise en ligne est un geste distinct, depuis le catalogue ou l'edition.
 */
export type UpdateActivityRequestDto = CreateActivityRequestDto & {
  status?: ActivityStatus;
};

export interface ActivityResponseDto {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  priceEur: number;
  prerequisites: ActivityPrerequisitesDto;
  includedEquipment: string[];
  photoFileIds: string[];
  status: ActivityStatus;
  createdAt: string;
  updatedAt: string;
}
