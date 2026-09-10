import type { TopActivityEntity } from '../../domain/entities/dashboard.entity';
import { Badge } from '@/core/components/ui/badge';

interface Props {
  activities: TopActivityEntity[];
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

const MEDAL_COLORS = [
  'bg-yellow-400/20 text-yellow-600',
  'bg-slate-300/20 text-slate-500',
  'bg-orange-400/20 text-orange-600',
];

export default function TopActivitiesList({ activities }: Props) {
  if (!activities.length) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Aucune activité pour cette période
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {activities.map((activity, index) => (
        <li
          key={activity.activityId}
          className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${MEDAL_COLORS[index] ?? 'bg-muted text-muted-foreground'}`}
            >
              {index + 1}
            </span>
            <span className="truncate text-sm font-medium">
              {activity.title}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="text-xs">
              {activity.bookingsCount} rés.
            </Badge>
            <span className="text-sm font-semibold text-primary">
              {formatEur(activity.revenueEur)}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
