import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import PaymentSuccessContent from '../components/PaymentSuccessContent';
import type { PaymentConfirmationEntity } from '../../domain/entities/payment.entity';
import routes from '@/core/constants/routes';

function PaymentSuccessError() {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-center text-muted-foreground">
        Impossible d'afficher la confirmation de paiement.
      </p>
      <Button variant="outline" onClick={() => navigate(routes.home)}>
        Retour à l'accueil
      </Button>
    </div>
  );
}

export default function PaymentSuccessPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const confirmation = location.state as PaymentConfirmationEntity | null;

  if (!bookingId || !confirmation) {
    return <PaymentSuccessError />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto max-w-md px-4 py-12"
    >
      <PaymentSuccessContent
        confirmation={confirmation}
        onGoToBooking={() =>
          navigate(routes.bookingConfirmation.replace(':id', bookingId))
        }
      />
    </motion.div>
  );
}
