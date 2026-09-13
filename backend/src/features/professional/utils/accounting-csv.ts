/**
 * Mise en forme du CSV comptable.
 *
 * Separateur point-virgule et decimales a la virgule : c'est ce qu'attendent
 * les tableurs en locale francaise, ou le fichier sera ouvert.
 */

export interface AccountingRow {
  bookingId: string;
  bookingDate: Date;
  slotDate: Date;
  activityTitle: string;
  customerName: string;
  participants: number;
  status: string;
  totalEur: number;
  vatEur: number;
  paidEur: number;
  refundedEur: number;
}

const HEADERS = [
  'Reservation',
  'Date reservation',
  'Date creneau',
  'Activite',
  'Client',
  'Participants',
  'Statut',
  'Total TTC',
  'TVA',
  'Encaisse',
  'Rembourse',
];

const amount = (value: number): string => value.toFixed(2).replace('.', ',');

const date = (value: Date): string =>
  value instanceof Date && !isNaN(value.getTime())
    ? value.toISOString().slice(0, 10)
    : '';

/** Un champ contenant separateur, guillemet ou saut de ligne doit etre protege. */
const escape = (value: string): string =>
  /[;"\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

export function buildAccountingCsv(rows: AccountingRow[]): string {
  const lines = [HEADERS.join(';')];

  for (const row of rows) {
    lines.push(
      [
        row.bookingId,
        date(row.bookingDate),
        date(row.slotDate),
        escape(row.activityTitle),
        escape(row.customerName),
        String(row.participants),
        row.status,
        amount(row.totalEur),
        amount(row.vatEur),
        amount(row.paidEur),
        amount(row.refundedEur),
      ].join(';'),
    );
  }

  // BOM : sans lui, Excel lit l'UTF-8 comme du latin-1 et abime les accents.
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}
