export interface AccountingExportRequestDto {
  format: 'csv_generic';
  from: string; // ISO 8601
  to: string; // ISO 8601
  includeRefunds: boolean;
  deliveryMode: 'download';
  /** Centre sur lequel porte l'export. */
  centerId?: string;
}

export interface AccountingExportResponseDto {
  exportJobId: string;
  status: 'ready' | 'queued';
  downloadUrl?: string;
  recordsCount: number;
}
