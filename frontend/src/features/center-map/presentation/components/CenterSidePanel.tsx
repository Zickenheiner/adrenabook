import { motion } from 'motion/react';
import { MapPin, Activity, ArrowRight, Inbox } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import { ScrollArea } from '@/core/components/ui/scroll-area';
import { Skeleton } from '@/core/components/ui/skeleton';
import type { CenterMapItemEntity } from '../../domain/entities/center-map.entity';
import { useNavigate } from 'react-router-dom';
import routes from '@/core/constants/routes';

interface Props {
  centers: CenterMapItemEntity[];
  isLoading: boolean;
  onCenterClick: (center: CenterMapItemEntity) => void;
}

export default function CenterSidePanel({
  centers,
  isLoading,
  onCenterClick,
}: Props) {
  const navigate = useNavigate();

  return (
    <aside className="flex flex-col h-full bg-card border-l border-border">
      <div className="p-4 border-b border-border shrink-0">
        <h2 className="font-semibold text-sm text-foreground">
          Centres dans cette zone
        </h2>
        {!isLoading && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {centers.length} centre{centers.length > 1 ? 's' : ''} trouvé
            {centers.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : centers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Aucun centre dans cette zone.
              <br />
              Déplacez la carte pour explorer.
            </p>
          </div>
        ) : (
          <motion.div
            className="p-3 space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.04 } },
            }}
          >
            {centers.map((center) => (
              <motion.div
                key={center.id}
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <button
                  className="w-full text-left rounded-lg border border-border bg-background hover:bg-accent hover:border-primary/30 transition-colors p-3 group cursor-pointer"
                  onClick={() => onCenterClick(center)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate leading-tight">
                          {center.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {center.city}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Activity className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs">
                      {center.activitiesCount} activité
                      {center.activitiesCount > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </ScrollArea>

      {!isLoading && centers.length > 0 && (
        <div className="p-3 border-t border-border shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => navigate(routes.activitySearch)}
          >
            Voir toutes les activités
          </Button>
        </div>
      )}
    </aside>
  );
}
