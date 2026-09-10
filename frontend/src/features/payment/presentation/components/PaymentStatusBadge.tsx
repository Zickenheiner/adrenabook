import { Badge } from '@/core/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';

interface Props {
  status: 'confirmed' | 'partial_paid';
}

export default function PaymentStatusBadge({ status }: Props) {
  if (status === 'confirmed') {
    return (
      <Badge className="gap-1 bg-green-500/15 text-green-600 hover:bg-green-500/20">
        <CheckCircle className="h-3 w-3" />
        Confirmé
      </Badge>
    );
  }

  return (
    <Badge className="gap-1 bg-amber-500/15 text-amber-600 hover:bg-amber-500/20">
      <Clock className="h-3 w-3" />
      Acompte versé
    </Badge>
  );
}
