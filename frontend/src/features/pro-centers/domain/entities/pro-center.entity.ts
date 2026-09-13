/** Etats du dossier d'instruction, cote administrateur. */
export type ProCenterStatus =
  'pending_review' | 'approved' | 'rejected' | 'awaiting_info';

export interface ProCenterAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface ProCenterEntity {
  id: string;
  name: string;
  city: string;
  address: ProCenterAddress;
  contactEmail: string;
  contactPhone: string;
  status: ProCenterStatus;
  /** Conditionne la suppression : un centre qui en porte n'est pas supprimable. */
  activitiesCount: number;
}
