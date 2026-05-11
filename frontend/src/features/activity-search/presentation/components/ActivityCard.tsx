import { motion } from 'motion/react';
import { Clock, MapPin, Star, Users } from 'lucide-react';
import { Badge } from '@/core/components/ui/badge';
import { Card, CardContent } from '@/core/components/ui/card';
import { cn } from '@/core/utils/cn';
import type { ActivityItemEntity } from '../../domain/entities/activity-search.entity';

interface Props {
  activity: ActivityItemEntity;
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

export default function ActivityCard({ activity }: Props) {
  return (
    <Card className="overflow-hidden border-border/50 hover:border-border hover:shadow-md transition-all duration-200 cursor-pointer group">
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={activity.coverPhotoUrl}
          alt={activity.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80';
          }}
        />
        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className="bg-background/90 backdrop-blur-sm text-xs font-medium"
          >
            {TYPE_LABELS[activity.type] ?? activity.type}
          </Badge>
        </div>
        {activity.rating !== undefined && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold">
              {activity.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {activity.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {activity.centerName}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={cn(
              'text-xs border',
              DIFFICULTY_COLORS[activity.difficulty] ?? '',
            )}
          >
            {DIFFICULTY_LABELS[activity.difficulty] ?? activity.difficulty}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDuration(activity.durationMinutes)}
          </span>
          {activity.distanceKm !== undefined && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {activity.distanceKm < 1
                ? `${Math.round(activity.distanceKm * 1000)} m`
                : `${activity.distanceKm.toFixed(1)} km`}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between pt-1 border-t border-border/50">
          <div>
            <span className="text-xs text-muted-foreground">À partir de</span>
            <p className="text-lg font-bold text-primary">
              {activity.priceFromEur.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50">
      <div className="h-48 bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 bg-muted animate-pulse rounded-full w-20" />
          <div className="h-5 bg-muted animate-pulse rounded w-16" />
        </div>
        <div className="pt-1 border-t border-border/50">
          <div className="h-6 bg-muted animate-pulse rounded w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityCardMotion({
  activity,
  index,
}: Props & { index: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <ActivityCard activity={activity} />
    </motion.div>
  );
}
