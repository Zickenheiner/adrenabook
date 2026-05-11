import { Badge } from '@/core/components/ui/badge';
import { cn } from '@/core/utils/cn';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { HealthStatus } from '../../domain/entities/health.entity';

interface Props {
  status: HealthStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  HealthStatus,
  {
    label: string;
    classes: string;
    icon: typeof CheckCircle2;
  }
> = {
  ok: {
    label: 'Opérationnel',
    classes:
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    icon: CheckCircle2,
  },
  degraded: {
    label: 'Dégradé',
    classes:
      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    icon: AlertTriangle,
  },
  down: {
    label: 'Indisponible',
    classes: 'bg-destructive/15 text-destructive border border-destructive/30',
    icon: XCircle,
  },
};

export default function HealthStatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 px-2.5 py-1 text-xs font-medium uppercase tracking-wide',
        config.classes,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
