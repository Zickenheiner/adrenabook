import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Activity, AlertCircle } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Separator } from '@/core/components/ui/separator';
import { Skeleton } from '@/core/components/ui/skeleton';
import { toast } from 'sonner';
import routes from '@/core/constants/routes';
import {
  useActivity,
  useUpdateActivity,
} from '../../domain/hooks/activity.hook';
import ActivityForm from '../components/ActivityForm';
import type { ActivityEntity } from '../../domain/entities/activity.entity';
import type { CreateActivityFormData } from '../../domain/schemas/activity.schema';
import type { UpdateActivityRequestDto } from '../../data/dtos/activity.dto';

/**
 * `pending_admin_review` est pose par le systeme et refuse par l'API : on
 * omet alors le champ, ce qui laisse le backend conserver l'etat en cours.
 */
const toUpdatePayload = ({
  status,
  ...rest
}: CreateActivityFormData): UpdateActivityRequestDto =>
  status === 'pending_admin_review' ? rest : { ...rest, status };

const toFormValues = (
  activity: ActivityEntity,
): Partial<CreateActivityFormData> => ({
  title: activity.title,
  description: activity.description,
  type: activity.type,
  difficulty: activity.difficulty,
  durationMinutes: activity.durationMinutes,
  priceFromEur: activity.priceFromEur,
  prerequisites: activity.prerequisites,
  includedEquipment: activity.includedEquipment,
  photoFileIds: activity.photoFileIds,
  status: activity.status,
});

function ProActivityEditSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}

function ProActivityEditError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-muted-foreground text-center">
        Une erreur est survenue lors du chargement de l'activité.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Réessayer
      </Button>
    </div>
  );
}

export default function ProActivityEditPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { activity, activityIsLoading, activityError } = useActivity(id);
  const { updateActivity, updateActivityIsPending } = useUpdateActivity();

  function handleSubmit(data: CreateActivityFormData) {
    updateActivity(
      { id, data: toUpdatePayload(data) },
      {
        onSuccess: () => {
          toast.success('Activité mise à jour');
          navigate(routes.proActivityList);
        },
        onError: () => {
          toast.error('Une erreur est survenue lors de la mise à jour');
        },
      },
    );
  }

  if (activityIsLoading) return <ProActivityEditSkeleton />;
  if (activityError || !activity) return <ProActivityEditError />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-4"
        >
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
            onClick={() => navigate(routes.proActivityList)}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au catalogue
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Modifier l'activité
              </h1>
              <p className="text-sm text-muted-foreground">
                Mettez à jour les informations de « {activity.title} »
              </p>
            </div>
          </div>
        </motion.div>

        <Separator />

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ActivityForm
            defaultValues={toFormValues(activity)}
            onSubmit={handleSubmit}
            isPending={updateActivityIsPending}
            submitLabel="Enregistrer les modifications"
          />
        </motion.div>
      </div>
    </div>
  );
}
