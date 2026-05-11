import { Card, CardContent, CardHeader } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu';
import { Clock, Euro, MoreVertical, Pencil, Trash2, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/core/utils/cn';
import type {
  ActivityEntity,
  ActivityDifficulty,
} from '../../domain/entities/activity.entity';
import ActivityStatusBadge from './ActivityStatusBadge';

interface Props {
  activity: ActivityEntity;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const difficultyConfig: Record<
  ActivityDifficulty,
  { label: string; className: string }
> = {
  beginner: { label: 'Débutant', className: 'text-green-600' },
  intermediate: { label: 'Intermédiaire', className: 'text-yellow-600' },
  advanced: { label: 'Avancé', className: 'text-red-600' },
};

export default function ActivityCard({ activity, onEdit, onDelete }: Props) {
  const diffConfig = difficultyConfig[activity.difficulty];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5 min-w-0">
              <h3 className="font-semibold text-base truncate">
                {activity.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <ActivityStatusBadge status={activity.status} />
                <span
                  className={cn(
                    'text-xs font-medium flex items-center gap-1',
                    diffConfig.className,
                  )}
                >
                  <Zap className="h-3 w-3" />
                  {diffConfig.label}
                </span>
              </div>
            </div>

            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(activity.id)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                  )}
                  {onEdit && onDelete && <DropdownMenuSeparator />}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(activity.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {activity.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {activity.durationMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Euro className="h-3.5 w-3.5" />À partir de{' '}
              {activity.priceFromEur} €
            </span>
            <span className="text-xs capitalize">{activity.type}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
