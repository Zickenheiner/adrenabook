export interface AccountingExportEntity {
  exportJobId: string;
  status: 'ready' | 'queued';
  downloadUrl?: string;
  recordsCount: number;
}
