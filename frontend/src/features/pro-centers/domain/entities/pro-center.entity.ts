/** Etats du dossier d'instruction, cote administrateur. */
export type ProCenterStatus =
  'pending_review' | 'approved' | 'rejected' | 'awaiting_info';

export interface ProCenterEntity {
  id: string;
  name: string;
  city: string;
  status: ProCenterStatus;
}
