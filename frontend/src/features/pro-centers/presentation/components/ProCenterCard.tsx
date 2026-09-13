import { Link } from 'react-router-dom';
import { ArrowRight, Building2, MapPin } from 'lucide-react';
import { Badge } from '@/core/components/ui/badge';
import { Card } from '@/core/components/ui/card';
import { cn } from '@/core/utils/cn';
import routes from '@/core/constants/routes';
import type {
  ProCenterEntity,
  ProCenterStatus,
} from '../../domain/entities/pro-center.entity';

const STATUS_CONFIG: Record<
  ProCenterStatus,
  { label: string; className: string }
> = {
  pending_review: {
    label: 'En cours de validation',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  },
  approved: {
    label: 'Validé',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  },
  rejected: {
    label: 'Refusé',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
  awaiting_info: {
    label: 'Informations demandées',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  },
};

interface Props {
  center: ProCenterEntity;
}

export default function ProCenterCard({ center }: Props) {
  const status = STATUS_CONFIG[center.status];
  // Un centre encore en instruction n'a pas d'activites a gerer : l'API
  // refuserait la creation tant qu'il n'est pas approuve.
  const manageable = center.status === 'approved';

  const body = (
    <Card
      className={cn(
        'flex h-full flex-col gap-3 p-5 transition-all duration-200',
        manageable
          ? 'border-border/50 hover:border-border hover:shadow-md'
          : 'border-border/50 opacity-80',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold">{center.name}</h3>
            {center.city && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {center.city}
              </p>
            )}
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn('shrink-0 text-xs', status?.className)}
        >
          {status?.label ?? center.status}
        </Badge>
      </div>

      {manageable ? (
        <p className="mt-auto flex items-center gap-1.5 text-sm font-medium text-link">
          Gérer les activités
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </p>
      ) : (
        <p className="mt-auto text-sm text-muted-foreground">
          Les activités seront accessibles une fois le dossier validé.
        </p>
      )}
    </Card>
  );

  if (!manageable) return body;

  return (
    <Link
      to={routes.proActivityList.replace(':centerId', center.id)}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Gérer les activités de ${center.name}`}
    >
      {body}
    </Link>
  );
}
