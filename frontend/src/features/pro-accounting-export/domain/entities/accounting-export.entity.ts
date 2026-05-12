export interface AccountingExportEntity {
  exportJobId: string;
  status: 'ready' | 'queued';
  downloadUrl?: string;
  emailDeliveredTo?: string;
  recordsCount: number;
}
