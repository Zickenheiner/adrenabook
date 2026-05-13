export interface RgpdExportResponseDto {
  requestId: string;
  status: 'queued' | 'processing' | 'ready';
  estimatedReadyAt: string;
  downloadUrl?: string;
}

export interface RgpdDeleteRequestDto {
  confirmationCode: string;
  reason?: string;
}

export interface RgpdDeleteResponseDto {
  requestId: string;
  scheduledDeletionAt: string;
  retainedData: string[];
}
