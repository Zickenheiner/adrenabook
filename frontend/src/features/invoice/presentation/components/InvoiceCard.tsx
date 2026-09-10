import { FileText, Calendar, Euro } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Separator } from '@/core/components/ui/separator';
import { Badge } from '@/core/components/ui/badge';
import type { InvoiceEntity } from '../../domain/entities/invoice.entity';
import InvoiceDownloadButton from './InvoiceDownloadButton';

interface Props {
  invoice: InvoiceEntity;
}

export default function InvoiceCard({ invoice }: Props) {
  const formattedDate = invoice.issuedAt.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const vatExcluded = invoice.totalEur - invoice.vatEur;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{invoice.invoiceNumber}</CardTitle>
            <p className="text-sm text-muted-foreground">Facture</p>
          </div>
        </div>
        <Badge variant="secondary">PDF</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>Émise le {formattedDate}</span>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Montant HT</span>
            <span>{vatExcluded.toFixed(2)} €</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">TVA</span>
            <span>{invoice.vatEur.toFixed(2)} €</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1">
              <Euro className="h-4 w-4" />
              Total TTC
            </span>
            <span className="text-primary">
              {invoice.totalEur.toFixed(2)} €
            </span>
          </div>
        </div>

        <InvoiceDownloadButton
          downloadUrl={invoice.downloadUrl}
          invoiceNumber={invoice.invoiceNumber}
        />
      </CardContent>
    </Card>
  );
}
