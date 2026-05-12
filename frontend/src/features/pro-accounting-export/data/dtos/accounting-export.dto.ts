export interface AccountingExportRequestDto {
  format: 'sage50' | 'sage100' | 'csv_generic';
  from: string; // ISO 8601
  to: string; // ISO 8601
  includeRefunds: boolean;
  deliveryMode: 'download' | 'email';
}

export interface AccountingExportResponseDto {
  exportJobId: string;
  status: 'ready' | 'queued';
  downloadUrl?: string;
  emailDeliveredTo?: string;
  recordsCount: number;
}
