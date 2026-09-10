import { Button } from '@/core/components/ui/button';
import { Loader2, Lock } from 'lucide-react';

interface Props {
  onConfirm: () => void;
  isPending: boolean;
  disabled?: boolean;
}

export default function PaymentConfirmButton({
  onConfirm,
  isPending,
  disabled = false,
}: Props) {
  return (
    <Button
      onClick={onConfirm}
      disabled={isPending || disabled}
      className="w-full gap-2"
      size="lg"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Traitement en cours…
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" />
          Confirmer le paiement
        </>
      )}
    </Button>
  );
}
