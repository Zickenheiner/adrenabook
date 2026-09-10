import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, Inbox, ArrowLeft } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Skeleton } from '@/core/components/ui/skeleton';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/core/components/ui/alert';
import { useInvoice } from '../../domain/hooks/invoice.hook';
import InvoiceCard from '../components/InvoiceCard';
import routes from '@/core/constants/routes';

function InvoiceDownloadSkeleton() {
  return (
    <div className="container mx-auto max-w-lg space-y-6 px-4 py-12">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4 rounded-xl border p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-px w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

function InvoiceDownloadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <Alert variant="destructive" className="w-full">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de récupérer votre facture. Elle est peut-être encore en
          cours de génération ou le paiement n'est pas finalisé.
        </AlertDescription>
      </Alert>
      <Button variant="outline" onClick={onRetry}>
        Réessayer
      </Button>
    </div>
  );
}

function InvoiceNotFound() {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4">
      <Inbox className="h-12 w-12 text-muted-foreground" />
      <p className="text-center text-muted-foreground">
        Aucune facture n'est disponible pour cette réservation.
      </p>
      <Button variant="outline" onClick={() => navigate(routes.home)}>
        Retour à l'accueil
      </Button>
    </div>
  );
}

export default function InvoiceDownloadPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoice, invoiceIsLoading, invoiceError } = useInvoice(
    bookingId ?? '',
  );

  if (!bookingId) {
    return <InvoiceNotFound />;
  }

  if (invoiceIsLoading) {
    return <InvoiceDownloadSkeleton />;
  }

  if (invoiceError) {
    return <InvoiceDownloadError onRetry={() => window.location.reload()} />;
  }

  if (!invoice) {
    return <InvoiceNotFound />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto max-w-lg px-4 py-12"
    >
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate(routes.bookingConfirmation.replace(':id', bookingId))
          }
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la réservation
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Ma facture</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Téléchargez votre facture en PDF pour vos besoins comptables.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <InvoiceCard invoice={invoice} />
      </motion.div>
    </motion.div>
  );
}
