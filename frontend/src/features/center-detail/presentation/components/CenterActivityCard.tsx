import { Link } from 'react-router-dom';
import { Clock, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/core/components/ui/badge';
import { Card } from '@/core/components/ui/card';
import { cn } from '@/core/utils/cn';
import { resolvePhotoUrl } from '@/core/utils/photo-url';
import routes from '@/core/constants/routes';
import type { CenterActivityEntity } from '../../domain/entities/center-detail.entity';

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
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

interface Props {
  activity: CenterActivityEntity;
}

export default function CenterActivityCard({ activity }: Props) {
  const [coverFailed, setCoverFailed] = useState(false);
  const coverUrl = resolvePhotoUrl(activity.coverPhotoUrl);
  const hasCover = !!coverUrl && !coverFailed;

  return (
    <Link
      to={routes.activityDetail.replace(':id', activity.id)}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Voir la fiche de l'activité ${activity.title}`}
    >
      <Card className="group h-full overflow-hidden border-border/50 transition-all duration-200 hover:border-border hover:shadow-md">
        <div className="relative h-40 overflow-hidden bg-muted">
          {hasCover ? (
            <img
              src={coverUrl}
              alt={activity.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
              <ImageIcon className="h-7 w-7" aria-hidden="true" />
              <span className="text-xs">Aucune photo</span>
            </div>
          )}
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 bg-background/90 text-xs font-medium backdrop-blur-sm"
          >
            {TYPE_LABELS[activity.type] ?? activity.type}
          </Badge>
        </div>

        <div className="space-y-3 p-4">
          <h3 className="line-clamp-2 font-semibold">{activity.title}</h3>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn('text-xs', DIFFICULTY_COLORS[activity.difficulty])}
            >
              {DIFFICULTY_LABELS[activity.difficulty] ?? activity.difficulty}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDuration(activity.durationMinutes)}
            </span>
          </div>

          <p className="text-sm">
            <span className="font-semibold">{activity.priceEur} €</span>
            <span className="text-muted-foreground"> / personne</span>
          </p>
        </div>
      </Card>
    </Link>
  );
}
