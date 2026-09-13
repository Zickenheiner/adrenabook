import { Button } from '@/core/components/ui/button';
import routes from '@/core/constants/routes';
import { Link } from 'react-router-dom';
import { Building2, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/core/components/ui/badge';
import { cn } from '@/core/utils/cn';
import type { ActivityDetailEntity } from '../../domain/entities/activity-detail.entity';

interface Props {
  activity: ActivityDetailEntity;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Expert',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  advanced: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const TYPE_LABELS: Record<string, string> = {
  bungee: "Saut à l'élastique",
  climbing: 'Escalade',
  diving: 'Plongée',
  paragliding: 'Parapente',
  canyoning: 'Canyoning',
  via_ferrata: 'Via ferrata',
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}

export default function ActivityHeader({ activity }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          {TYPE_LABELS[activity.type] ?? activity.type}
        </Badge>
        <Badge
          variant="outline"
          className={cn('border', DIFFICULTY_COLORS[activity.difficulty] ?? '')}
        >
          {DIFFICULTY_LABELS[activity.difficulty] ?? activity.difficulty}
        </Badge>
      </div>

      <h1 className="text-3xl font-bold tracking-tight">{activity.title}</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{formatDuration(activity.durationMinutes)}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>{activity.center.location.address}</span>
        </div>
      </div>

      <div className="flex items-baseline gap-2 pt-2">
        <span className="text-3xl font-bold text-primary">
          {activity.priceEur.toLocaleString('fr-FR', {
            style: 'currency',
            currency: 'EUR',
          })}
        </span>
        <span className="text-sm text-muted-foreground">par personne</span>
      </div>

      {activity.center.id && (
        <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
          <Link to={routes.centerDetail.replace(':id', activity.center.id)}>
            <Building2 className="mr-2 h-4 w-4" aria-hidden="true" />
            {activity.center.name
              ? `Voir le centre · ${activity.center.name}`
              : 'Voir le centre'}
          </Link>
        </Button>
      )}
    </div>
  );
}
