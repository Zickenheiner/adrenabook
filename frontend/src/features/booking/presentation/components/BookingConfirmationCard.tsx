import { CheckCircle2, Euro, Receipt, Users } from 'lucide-react';
import { motion } from 'motion/react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Separator } from '@/core/components/ui/separator';
import { Badge } from '@/core/components/ui/badge';
import type { BookingEntity } from '../../domain/entities/booking.entity';

interface Props {
  booking: BookingEntity;
}

export default function BookingConfirmationCard({ booking }: Props) {
  const netEur = booking.totalEur - booking.vatEur;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Réservation confirmée</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Référence :{' '}
                <span className="font-mono font-medium text-foreground">
                  {booking.bookingId}
                </span>
              </p>
            </div>
            <Badge variant="outline" className="ml-auto text-xs">
              En attente de paiement
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator />

          {/* Récapitulatif financier */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <span>Récapitulatif</span>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Sous-total HT</span>
                <span>
                  {netEur.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>TVA</span>
                <span>
                  {booking.vatEur.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between font-semibold text-foreground">
                <div className="flex items-center gap-1">
                  <Euro className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Total TTC</span>
                </div>
                <span>
                  {booking.totalEur.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Info paiement */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              Procédez au paiement avant l'expiration du délai pour confirmer
              définitivement vos places.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
