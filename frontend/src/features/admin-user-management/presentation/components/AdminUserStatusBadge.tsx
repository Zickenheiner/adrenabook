import { Badge } from '@/core/components/ui/badge';
import { cn } from '@/core/utils/cn';

interface Props {
  status: 'active' | 'suspended' | 'banned';
}

const STATUS_LABELS: Record<Props['status'], string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  banned: 'Banni',
};

const STATUS_VARIANTS: Record<
  Props['status'],
  'default' | 'secondary' | 'destructive'
> = {
  active: 'default',
  suspended: 'secondary',
  banned: 'destructive',
};

export default function AdminUserStatusBadge({ status }: Props) {
  return (
    <Badge
      variant={STATUS_VARIANTS[status]}
      className={cn(
        status === 'active' &&
          'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20',
      )}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
