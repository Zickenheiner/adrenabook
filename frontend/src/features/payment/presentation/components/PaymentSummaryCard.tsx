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
  depositPercent?: number;
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
  depositPercent = 30,
  totalAmountEur,
}: Props) {
  const depositAmount = (totalAmountEur * depositPercent) / 100;
  const remainingAmount = totalAmountEur - depositAmount;

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
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Acompte ({depositPercent}%)</span>
            <span className="font-semibold text-primary">
              {formatEur(depositAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Solde restant (dû à J-7)</span>
            <span>{formatEur(remainingAmount)}</span>
          </div>
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
          Paiement sécurisé par Stripe — 3D Secure obligatoire
        </p>
      </CardContent>
    </Card>
  );
}
