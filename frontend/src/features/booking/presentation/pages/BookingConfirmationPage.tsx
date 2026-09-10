import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Separator } from '@/core/components/ui/separator';
import { Skeleton } from '@/core/components/ui/skeleton';
import routes from '@/core/constants/routes';
import { ApiError } from '@/core/errors/api.error';
import { useBookingDetail } from '../../domain/hooks/booking-detail.hook';
import BookingConfirmationCard from '../components/BookingConfirmationCard';
import BookingTimer from '../components/BookingTimer';

function BookingConfirmationSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-11 w-full rounded-lg" />
      <Skeleton className="h-72 w-full rounded-xl" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  );
}

function BookingConfirmationError({ error }: { error: unknown }) {
  const navigate = useNavigate();
  const status = error instanceof ApiError ? error.status : undefined;
  const isForbidden = status === 403;

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center gap-4 min-h-[50vh]">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-lg font-semibold">
        {isForbidden ? 'Accès non autorisé' : 'Réservation introuvable'}
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {isForbidden
          ? "Cette réservation n'est pas la vôtre, vous ne pouvez pas en consulter le détail."
          : "Cette réservation n'existe pas ou n'est plus disponible."}
      </p>
      <Button variant="outline" onClick={() => navigate(routes.activitySearch)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à la recherche
      </Button>
    </div>
  );
}

export default function BookingConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { booking, bookingIsLoading, bookingError } = useBookingDetail(
    id ?? '',
  );

  const handleExpire = useCallback(() => {
    navigate(routes.activitySearch);
  }, [navigate]);

  if (!id) return <BookingConfirmationError error={null} />;

  if (bookingIsLoading) return <BookingConfirmationSkeleton />;

  if (bookingError || !booking)
    return <BookingConfirmationError error={bookingError} />;

  const isAwaitingPayment =
    booking.status === 'pending_payment' || booking.status === 'partial_paid';

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

      {/* Timer de réservation (masqué si l'API ne renvoie pas de délai) */}
      <BookingTimer
        expiresAt={booking.reservationExpiresAt}
        onExpire={handleExpire}
      />

      {/* Carte de confirmation */}
      <BookingConfirmationCard booking={booking} />

      {isAwaitingPayment && (
        <>
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
        </>
      )}
    </motion.div>
  );
}
