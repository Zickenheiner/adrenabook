import { Badge } from '@/core/components/ui/badge';
import { cn } from '@/core/utils/cn';
import type { ActivityStatus } from '../../domain/entities/activity.entity';

interface Props {
  status: ActivityStatus;
}

const statusConfig: Record<
  ActivityStatus,
  { label: string; className: string }
> = {
  draft: {
    label: 'Brouillon',
    className: 'bg-muted text-muted-foreground border-muted-foreground/30',
  },
  pending_admin_review: {
    label: 'En attente de validation',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  },
  published: {
    label: 'Publiée',
    className: 'bg-green-500/10 text-green-600 border-green-500/30',
  },
  archived: {
    label: 'Archivée',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
};

export default function ActivityStatusBadge({ status }: Props) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium', config.className)}
    >
      {config.label}
    </Badge>
  );
}
