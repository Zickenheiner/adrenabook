export interface InvoiceEntity {
  invoiceNumber: string;
  issuedAt: Date;
  totalEur: number;
  vatEur: number;
  downloadUrl: string;
}
