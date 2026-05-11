import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Separator } from '@/core/components/ui/separator';
import routes from '@/core/constants/routes';
import type { BookingEntity } from '../../domain/entities/booking.entity';
import BookingConfirmationCard from '../components/BookingConfirmationCard';
import BookingTimer from '../components/BookingTimer';

export default function BookingConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const expiresAtRaw = searchParams.get('expiresAt');
  const totalEur = Number(searchParams.get('totalEur') ?? 0);
  const vatEur = Number(searchParams.get('vatEur') ?? 0);
  const paymentIntentClientSecret = searchParams.get('clientSecret') ?? '';

  const booking: BookingEntity | null =
    id && expiresAtRaw
      ? {
          bookingId: id,
          status: 'pending_payment',
          reservationExpiresAt: new Date(expiresAtRaw),
          totalEur,
          vatEur,
          paymentIntentClientSecret,
        }
      : null;

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center gap-4 min-h-[50vh]">
        <p className="text-muted-foreground">Réservation introuvable.</p>
        <Button
          variant="outline"
          onClick={() => navigate(routes.activitySearch)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la recherche
        </Button>
      </div>
    );
  }

  const handleExpire = () => {
    navigate(routes.activitySearch);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl space-y-6"
    >
      {/* Navigation retour */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(routes.activitySearch)}
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Retour à la recherche
      </Button>

      {/* Timer de réservation */}
      <BookingTimer
        expiresAt={booking.reservationExpiresAt}
        onExpire={handleExpire}
      />

      {/* Carte de confirmation */}
      <BookingConfirmationCard booking={booking} />

      <Separator />

      {/* CTA paiement */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="space-y-3"
      >
        <p className="text-sm text-muted-foreground text-center">
          Finalisez votre paiement pour confirmer définitivement votre
          réservation.
        </p>
        <Button className="w-full" size="lg" disabled>
          <CreditCard className="mr-2 h-4 w-4" />
          Procéder au paiement (Stripe)
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Paiement sécurisé — intégration Stripe à venir
        </p>
      </motion.div>
    </motion.div>
  );
}
