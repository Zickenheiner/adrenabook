import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, ArrowLeft, Building2, Inbox, MapPin } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Separator } from '@/core/components/ui/separator';
import { Skeleton } from '@/core/components/ui/skeleton';
import { Badge } from '@/core/components/ui/badge';
import routes from '@/core/constants/routes';
import { useCenterDetail } from '../../domain/hooks/center-detail.hook';
import CenterActivityCard from '../components/CenterActivityCard';

function CenterDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function CenterDetailError() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-center text-muted-foreground">
        Ce centre est introuvable ou n'est plus disponible.
      </p>
      <Button variant="outline" onClick={() => navigate(routes.centerMap)}>
        Retour à la carte
      </Button>
    </div>
  );
}

export default function CenterDetailPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { center, centerIsLoading, centerError } = useCenterDetail(id);

  if (centerIsLoading) return <CenterDetailSkeleton />;
  if (centerError || !center) return <CenterDetailError />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-4"
        >
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(routes.centerMap)}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la carte
          </Button>

          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                {center.name}
              </h1>
              {center.address && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {center.address}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <Separator />

        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Activités proposées</h2>
          <Badge variant="secondary">{center.activities.length}</Badge>
        </div>

        {center.activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium">Aucune activité publiée</p>
            <p className="text-sm text-muted-foreground">
              Ce centre n'a pas encore d'activité à réserver.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {center.activities.map((activity) => (
              <CenterActivityCard key={activity.id} activity={activity} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
