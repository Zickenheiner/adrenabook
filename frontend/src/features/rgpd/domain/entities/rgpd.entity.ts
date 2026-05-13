export interface RgpdExportEntity {
  requestId: string;
  status: 'queued' | 'processing' | 'ready';
  estimatedReadyAt: Date;
  downloadUrl?: string;
}

export interface RgpdDeleteEntity {
  requestId: string;
  scheduledDeletionAt: Date;
  retainedData: string[];
}
