import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Separator } from '@/core/components/ui/separator';
import { CreditCard, Euro } from 'lucide-react';

interface Props {
  bookingId: string;
  totalAmountEur: number;
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export default function PaymentSummaryCard({
  bookingId,
  totalAmountEur,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4 text-primary" />
          Récapitulatif du paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Référence réservation</span>
          <span className="font-mono text-xs">{bookingId}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between font-semibold">
          <span className="flex items-center gap-1">
            <Euro className="h-4 w-4" />
            Total
          </span>
          <span>{formatEur(totalAmountEur)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Paiement simulé — aucun encaissement réel n&apos;est effectué
        </p>
      </CardContent>
    </Card>
  );
}
