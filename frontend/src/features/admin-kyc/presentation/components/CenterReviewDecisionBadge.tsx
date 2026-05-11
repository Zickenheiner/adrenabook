import { Badge } from '@/core/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/core/utils/cn';

type Decision = 'approve' | 'reject' | 'request_more_info';

interface Props {
  decision: Decision;
  className?: string;
}

const DECISION_CONFIG: Record<
  Decision,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  approve: {
    label: 'Approuver',
    icon: CheckCircle,
    className: 'bg-success/10 text-success border-success/20',
  },
  reject: {
    label: 'Refuser',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  request_more_info: {
    label: 'Infos manquantes',
    icon: Clock,
    className: 'bg-warning/10 text-warning border-warning/20',
  },
};

export default function CenterReviewDecisionBadge({
  decision,
  className,
}: Props) {
  const config = DECISION_CONFIG[decision];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1 font-medium',
        config.className,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
