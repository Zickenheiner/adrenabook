import { motion } from 'motion/react';
import { CheckCircle2, CalendarClock, ArrowRight } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Separator } from '@/core/components/ui/separator';
import PaymentStatusBadge from './PaymentStatusBadge';
import type { PaymentConfirmationEntity } from '../../domain/entities/payment.entity';

interface Props {
  confirmation: PaymentConfirmationEntity;
  onGoToBooking: () => void;
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function PaymentSuccessContent({
  confirmation,
  onGoToBooking,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center gap-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15"
      >
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </motion.div>

      <div className="text-center">
        <h2 className="text-xl font-semibold">Paiement réussi !</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Votre réservation est maintenant confirmée.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            Détails du paiement
            <PaymentStatusBadge status={confirmation.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Montant réglé</span>
            <span className="font-semibold text-green-600">
              {formatEur(confirmation.paidAmountEur)}
            </span>
          </div>

          {confirmation.remainingAmountEur > 0 && (
            <>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Solde restant</span>
                <span className="font-medium">
                  {formatEur(confirmation.remainingAmountEur)}
                </span>
              </div>
              {confirmation.finalPaymentDueAt && (
                <div className="flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
                  <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Solde à régler avant le{' '}
                    <strong>
                      {formatDate(confirmation.finalPaymentDueAt)}
                    </strong>
                  </span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Button onClick={onGoToBooking} className="w-full gap-2">
        Voir ma réservation
        <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
