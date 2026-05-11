export interface InvoiceMetadataResponseDto {
  invoiceNumber: string; // ex : 'INV-2026-000123'
  issuedAt: string;
  totalEur: number;
  vatEur: number;
  downloadUrl: string; // URL signée valable 1h
}
