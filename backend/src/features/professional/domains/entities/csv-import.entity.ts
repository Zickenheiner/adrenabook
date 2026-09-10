import { ApiProperty } from '@nestjs/swagger';
import { CsvImport } from '../schemas/csv-import.schema';

export class CsvImportEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'The unique identifier of the csv import job',
  })
  private readonly id: CsvImport;

  private entityType: string;
  private fileId: string;
  private columnMapping: Record<string, string>;
  private dryRun: boolean;
  private status: string;
  private rowsTotal: number;
  private rowsSuccess: number;
  private rowsErrors: number;
  private errors: { line: number; column: string; reason: string }[];
  private professionalId: string;

  constructor(_id: CsvImport) {
    this.id = _id;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getObjectId(): CsvImport {
    return this.id;
  }

  getEntityType(): string {
    return this.entityType;
  }

  getFileId(): string {
    return this.fileId;
  }

  getColumnMapping(): Record<string, string> {
    return this.columnMapping;
  }

  getDryRun(): boolean {
    return this.dryRun;
  }

  getStatus(): string {
    return this.status;
  }

  getRowsTotal(): number {
    return this.rowsTotal;
  }

  getRowsSuccess(): number {
    return this.rowsSuccess;
  }

  getRowsErrors(): number {
    return this.rowsErrors;
  }

  getErrors(): { line: number; column: string; reason: string }[] {
    return this.errors;
  }

  getProfessionalId(): string {
    return this.professionalId;
  }

  // ———————SETTER———————

  setEntityType(value: string): void {
    this.entityType = value;
  }

  setFileId(value: string): void {
    this.fileId = value;
  }

  setColumnMapping(value: Record<string, string>): void {
    this.columnMapping = value;
  }

  setDryRun(value: boolean): void {
    this.dryRun = value;
  }

  setStatus(value: string): void {
    this.status = value;
  }

  setRowsTotal(value: number): void {
    this.rowsTotal = value;
  }

  setRowsSuccess(value: number): void {
    this.rowsSuccess = value;
  }

  setRowsErrors(value: number): void {
    this.rowsErrors = value;
  }

  setErrors(value: { line: number; column: string; reason: string }[]): void {
    this.errors = value;
  }

  setProfessionalId(value: string): void {
    this.professionalId = value;
  }
}
