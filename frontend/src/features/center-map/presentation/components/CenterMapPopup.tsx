import { useNavigate } from 'react-router-dom';
import { MapPin, Activity, ArrowRight } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import type { CenterMapItemEntity } from '../../domain/entities/center-map.entity';
import routes from '@/core/constants/routes';

interface Props {
  center: CenterMapItemEntity;
}

export default function CenterMapPopup({ center }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2 min-w-[180px]">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary shrink-0" />
        <span className="font-semibold text-sm leading-tight">
          {center.name}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Activity className="h-3 w-3 text-muted-foreground" />
        <Badge variant="secondary" className="text-xs">
          {center.activitiesCount} activité
          {center.activitiesCount > 1 ? 's' : ''}
        </Badge>
      </div>
      <Button
        size="sm"
        className="w-full mt-1"
        onClick={() =>
          navigate(routes.activitySearch + `?centerId=${center.id}`)
        }
      >
        Voir les activités
        <ArrowRight className="ml-1 h-3 w-3" />
      </Button>
    </div>
  );
}
