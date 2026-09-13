import { buildInvoicePdf, type InvoiceData } from './invoice-pdf';

const data = (overrides: Partial<InvoiceData> = {}): InvoiceData => ({
  invoiceNumber: 'FA-2026-0001',
  issuedAt: new Date('2026-03-01T10:00:00.000Z'),
  customerName: 'Marie Dupont',
  customerEmail: 'marie@example.fr',
  centerName: 'Chamonix Vertical',
  centerAddress: '12 rue des Alpes, 74400 Chamonix, France',
  lines: [{ label: 'Parapente biplace', quantity: 2, unitPriceEur: 120 }],
  totalEur: 240,
  vatEur: 40,
  ...overrides,
});

describe('buildInvoicePdf', () => {
  it('produces a real PDF file', async () => {
    const pdf = await buildInvoicePdf(data());

    // Tout PDF valide commence par cette signature : un fichier qui ne la
    // porte pas ne s'ouvrira dans aucun lecteur.
    expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(pdf.length).toBeGreaterThan(500);
  });

  it('closes the document properly', async () => {
    const pdf = await buildInvoicePdf(data());

    expect(pdf.toString('latin1')).toContain('%%EOF');
  });

  it('survives a booking with no center attached', async () => {
    const pdf = await buildInvoicePdf(
      data({ centerName: '', centerAddress: '' }),
    );

    expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  it('handles several lines', async () => {
    const pdf = await buildInvoicePdf(
      data({
        lines: [
          { label: 'Parapente biplace', quantity: 2, unitPriceEur: 120 },
          { label: 'Photos du vol', quantity: 1, unitPriceEur: 15 },
        ],
      }),
    );

    expect(pdf.length).toBeGreaterThan(500);
  });
});
