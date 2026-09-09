export interface WaiverEntity {
  waiverId: string;
  signedAt: Date;
  documentHash: string;
  downloadUrl: string | null;
}
