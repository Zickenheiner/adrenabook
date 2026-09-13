import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/core/components/ui/alert';
import { Skeleton } from '@/core/components/ui/skeleton';
import { useConfirmPayment } from '../../domain/hooks/payment.hook';
import PaymentSummaryCard from '../components/PaymentSummaryCard';
import PaymentConfirmButton from '../components/PaymentConfirmButton';
import routes from '@/core/constants/routes';

function PaymentPageSkeleton() {
  return (
    <div className="container mx-auto max-w-md px-4 py-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}

export default function PaymentPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentIntentId = searchParams.get('payment_intent') ?? '';
  const totalAmountEur = Number(searchParams.get('amount') ?? 0);

  const { confirmPayment, confirmPaymentIsPending, confirmPaymentError } =
    useConfirmPayment(bookingId ?? '');

  if (!bookingId) return <PaymentPageSkeleton />;

  const handleConfirm = () => {
    if (!paymentIntentId) return;
    confirmPayment(
      { paymentIntentId },
      {
        onSuccess: (confirmation) => {
          // La page de succes lit la confirmation dans l'etat de navigation :
          // sans elle, elle ne peut qu'afficher une erreur.
          navigate(routes.paymentSuccess.replace(':id', bookingId), {
            state: confirmation,
          });
        },
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto max-w-md px-4 py-8 space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Paiement sécurisé</h1>
          <p className="text-sm text-muted-foreground">
            Confirmez votre acompte pour finaliser la réservation
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2 text-xs text-green-700">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>Paiement chiffré — 3D Secure activé</span>
      </div>

      <PaymentSummaryCard
        bookingId={bookingId}
        totalAmountEur={totalAmountEur}
      />

      {confirmPaymentError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur de paiement</AlertTitle>
          <AlertDescription>
            {confirmPaymentError instanceof Error
              ? confirmPaymentError.message
              : 'Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.'}
          </AlertDescription>
        </Alert>
      )}

      <PaymentConfirmButton
        onConfirm={handleConfirm}
        isPending={confirmPaymentIsPending}
        disabled={!paymentIntentId}
      />

      {!paymentIntentId && (
        <p className="text-center text-xs text-muted-foreground">
          Aucune référence de paiement. Repassez par la réservation pour
          initialiser le paiement.
        </p>
      )}
    </motion.div>
  );
}
