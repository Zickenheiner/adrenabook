import { Building2, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import { Card } from '@/core/components/ui/card';
import { cn } from '@/core/utils/cn';
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
  onEdit: (center: ProCenterEntity) => void;
  onDelete: (center: ProCenterEntity) => void;
}

export default function ProCenterCard({ center, onEdit, onDelete }: Props) {
  const status = STATUS_CONFIG[center.status];
  // Un centre encore en instruction n'a pas d'activites a gerer : l'API
  // refuserait la creation tant qu'il n'est pas approuve.
  const manageable = center.status === 'approved';

  return (
    <Card
      className={cn(
        'flex h-full flex-col gap-3 border-border/50 p-5',
        !manageable && 'opacity-80',
      )}
    >
      <div className="flex items-center justify-between gap-3">
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
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="outline" className={cn('text-xs', status?.className)}>
            {status?.label ?? center.status}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label={`Modifier ${center.name}`}
            onClick={() => onEdit(center)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            aria-label={`Supprimer ${center.name}`}
            onClick={() => onDelete(center)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!manageable && (
        <p className="mt-auto text-sm text-muted-foreground">
          Les activités seront accessibles une fois le dossier validé.
        </p>
      )}
    </Card>
  );
}
