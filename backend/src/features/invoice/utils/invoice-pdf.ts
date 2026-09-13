import PDFDocument = require('pdfkit');

export interface InvoiceLine {
  label: string;
  quantity: number;
  unitPriceEur: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  issuedAt: Date;
  customerName: string;
  customerEmail: string;
  centerName: string;
  centerAddress: string;
  lines: InvoiceLine[];
  totalEur: number;
  vatEur: number;
}

const euros = (amount: number): string =>
  `${amount.toFixed(2).replace('.', ',')} €`;

const day = (date: Date): string =>
  date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

/**
 * Compose la facture PDF.
 *
 * Rend le document en memoire plutot que sur disque : il est servi a la
 * demande et n'a pas a etre conserve, la facture etant reconstituable a partir
 * de la reservation.
 */
export function buildInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ——— En-tete ———
    doc.fontSize(20).text('AdrenaBook', { continued: false });
    doc.fontSize(9).fillColor('#666').text('Réservation d’activités outdoor');

    doc.moveDown(1.5);
    doc.fillColor('#000').fontSize(16).text('FACTURE');
    doc
      .fontSize(10)
      .fillColor('#666')
      .text(`N° ${data.invoiceNumber}`)
      .text(`Émise le ${day(data.issuedAt)}`);

    // ——— Parties ———
    doc.moveDown(1.5);
    const partiesTop = doc.y;

    doc.fillColor('#000').fontSize(10).text('Prestataire', 50, partiesTop);
    doc
      .fontSize(9)
      .fillColor('#333')
      .text(data.centerName || '—', 50, doc.y, { width: 220 });
    if (data.centerAddress) {
      doc.text(data.centerAddress, 50, doc.y, { width: 220 });
    }

    doc.fillColor('#000').fontSize(10).text('Client', 320, partiesTop);
    doc
      .fontSize(9)
      .fillColor('#333')
      .text(data.customerName || '—', 320, doc.y, { width: 220 });
    if (data.customerEmail) {
      doc.text(data.customerEmail, 320, doc.y, { width: 220 });
    }

    // ——— Lignes ———
    doc.moveDown(2.5);
    let y = doc.y;

    doc.fillColor('#000').fontSize(9);
    doc.text('Désignation', 50, y);
    doc.text('Qté', 330, y, { width: 40, align: 'right' });
    doc.text('P.U.', 380, y, { width: 70, align: 'right' });
    doc.text('Montant', 460, y, { width: 85, align: 'right' });

    y += 14;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#ddd').stroke();
    y += 10;

    for (const line of data.lines) {
      doc.fillColor('#333').fontSize(9);
      doc.text(line.label, 50, y, { width: 270 });
      doc.text(String(line.quantity), 330, y, { width: 40, align: 'right' });
      doc.text(euros(line.unitPriceEur), 380, y, {
        width: 70,
        align: 'right',
      });
      doc.text(euros(line.quantity * line.unitPriceEur), 460, y, {
        width: 85,
        align: 'right',
      });
      y = doc.y + 8;
    }

    doc.moveTo(50, y).lineTo(545, y).strokeColor('#ddd').stroke();
    y += 12;

    // ——— Totaux ———
    const ht = data.totalEur - data.vatEur;

    doc.fillColor('#333').fontSize(9);
    doc.text('Total HT', 380, y, { width: 70, align: 'right' });
    doc.text(euros(ht), 460, y, { width: 85, align: 'right' });
    y += 16;

    doc.text('TVA', 380, y, { width: 70, align: 'right' });
    doc.text(euros(data.vatEur), 460, y, { width: 85, align: 'right' });
    y += 18;

    doc.fillColor('#000').fontSize(11);
    doc.text('Total TTC', 380, y, { width: 70, align: 'right' });
    doc.text(euros(data.totalEur), 460, y, { width: 85, align: 'right' });

    // ——— Pied ———
    doc
      .fontSize(8)
      .fillColor('#888')
      .text(
        'Facture acquittée. TVA de 20 % applicable aux activités de loisir sportif encadré.',
        50,
        760,
        { width: 495, align: 'center' },
      );

    doc.end();
  });
}
