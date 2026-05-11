import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/core/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Skeleton } from '@/core/components/ui/skeleton';
import routes from '@/core/constants/routes';
import { useCancelBooking } from '../../domain/hooks/booking-cancellation.hook';
import CancellationForm from '../components/CancellationForm';
import RefundSummary from '../components/RefundSummary';
import type { CancelBookingFormData } from '../../domain/schemas/booking-cancellation.schema';

function CancellationPageSkeleton() {
  return (
    <div className="container mx-auto max-w-lg px-4 py-10 space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-6 w-64" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

function CancellationPageError() {
  return (
    <div className="container mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-10">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-center text-muted-foreground">
        Une erreur est survenue lors de l&apos;annulation. Veuillez réessayer.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Réessayer
      </Button>
    </div>
  );
}

export default function BookingCancellationPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    cancelBooking,
    cancelBookingIsPending,
    cancelBookingError,
    cancellationResult,
  } = useCancelBooking();

  const handleSubmit = (data: CancelBookingFormData) => {
    if (!bookingId) return;

    cancelBooking(
      { bookingId, data },
      {
        onSuccess: () => {
          toast.success('Votre réservation a bien été annulée.');
        },
        onError: () => {
          toast.error("Une erreur est survenue lors de l'annulation.");
        },
      },
    );
  };

  if (!bookingId) return <CancellationPageError />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto max-w-lg px-4 py-10"
    >
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 -ml-2 gap-1.5 text-muted-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Annuler ma réservation</CardTitle>
          <CardDescription>
            Renseignez le motif de votre annulation. Le remboursement sera
            traité automatiquement selon la politique en vigueur.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {cancellationResult ? (
            <>
              <RefundSummary cancellation={cancellationResult} />
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate(routes.home)}
              >
                Retour à l&apos;accueil
              </Button>
            </>
          ) : cancelBookingError ? (
            <CancellationPageError />
          ) : cancelBookingIsPending ? (
            <CancellationPageSkeleton />
          ) : (
            <CancellationForm
              onSubmit={handleSubmit}
              isPending={cancelBookingIsPending}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
