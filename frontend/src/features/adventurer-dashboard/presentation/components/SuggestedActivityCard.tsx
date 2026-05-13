import { Card, CardContent } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { Clock, Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import routes from '@/core/constants/routes';
import type { ActivitySummaryEntity } from '../../domain/entities/dashboard.entity';

interface Props {
  activity: ActivitySummaryEntity;
}

const difficultyLabel: Record<ActivitySummaryEntity['difficulty'], string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Expert',
};

export default function SuggestedActivityCard({ activity }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(routes.activityDetail.replace(':id', activity.id));
  };

  const durationHours = Math.floor(activity.durationMinutes / 60);
  const durationMins = activity.durationMinutes % 60;
  const durationLabel =
    durationHours > 0
      ? `${durationHours}h${durationMins > 0 ? durationMins : ''}`
      : `${durationMins} min`;

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
      onClick={handleClick}
    >
      {activity.coverPhotoUrl && (
        <div className="relative h-40 w-full">
          <img
            src={activity.coverPhotoUrl}
            alt={activity.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {activity.rating !== undefined && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{activity.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      )}
      <CardContent className="p-3 space-y-2">
        <div className="space-y-0.5">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {activity.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{activity.centerName}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{durationLabel}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {difficultyLabel[activity.difficulty]}
          </Badge>
        </div>
        <p className="text-sm font-semibold text-primary">
          À partir de {activity.priceFromEur} €
        </p>
      </CardContent>
    </Card>
  );
}
