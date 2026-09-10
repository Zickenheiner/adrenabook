export interface CsvImportErrorEntity {
  line: number;
  column: string;
  reason: string;
}

export interface CsvImportEntity {
  importJobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  rowsTotal: number;
  rowsSuccess: number;
  rowsErrors: number;
  errors: CsvImportErrorEntity[];
}
