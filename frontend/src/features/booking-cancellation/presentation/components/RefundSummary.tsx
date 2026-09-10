import { motion } from 'motion/react';
import { CheckCircle2, Clock, Euro } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { Separator } from '@/core/components/ui/separator';
import type { BookingCancellationEntity } from '../../domain/entities/booking-cancellation.entity';

const POLICY_LABELS: Record<string, string> = {
  full: 'Remboursement intégral',
  partial: 'Remboursement partiel',
  none: 'Aucun remboursement',
};

const POLICY_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> =
  {
    full: 'default',
    partial: 'secondary',
    none: 'destructive',
  };

interface Props {
  cancellation: BookingCancellationEntity;
}

export default function RefundSummary({ cancellation }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            Annulation confirmée
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Politique appliquée
            </span>
            <Badge variant={POLICY_VARIANTS[cancellation.refundPolicyApplied]}>
              {POLICY_LABELS[cancellation.refundPolicyApplied]}
            </Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Euro className="h-4 w-4" />
              Montant remboursé
            </span>
            <span className="text-lg font-semibold">
              {cancellation.refundedAmountEur.toFixed(2)} €
            </span>
          </div>

          {cancellation.refundedAmountEur > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Délai de remboursement
                </span>
                <span className="text-sm font-medium">
                  {cancellation.refundEta}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Le remboursement sera effectué sur le moyen de paiement
                d&apos;origine.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
