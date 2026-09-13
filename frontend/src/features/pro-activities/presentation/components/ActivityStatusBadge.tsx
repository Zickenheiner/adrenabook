import { Badge } from '@/core/components/ui/badge';
import { cn } from '@/core/utils/cn';
import type { ActivityStatus } from '../../domain/entities/activity.entity';

interface Props {
  status: ActivityStatus;
}

export const statusConfig: Record<
  ActivityStatus,
  { label: string; className: string }
> = {
  unpublished: {
    label: 'Non publiée',
    className: 'bg-muted text-muted-foreground border-muted-foreground/30',
  },
  published: {
    label: 'Publiée',
    className: 'bg-green-500/10 text-green-600 border-green-500/30',
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
