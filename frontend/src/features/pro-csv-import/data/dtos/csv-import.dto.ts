export interface CsvImportRequestDto {
  entityType: 'slots' | 'customers' | 'activities';
  fileId: string;
  columnMapping: Record<string, string>;
  dryRun: boolean;
}

export interface CsvImportErrorDto {
  line: number;
  column: string;
  reason: string;
}

export interface CsvImportResponseDto {
  importJobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  rowsTotal: number;
  rowsSuccess: number;
  rowsErrors: number;
  errors: CsvImportErrorDto[];
}
