import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Activity } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Separator } from '@/core/components/ui/separator';
import { toast } from 'sonner';
import routes from '@/core/constants/routes';
import { useCreateActivity } from '../../domain/hooks/activity.hook';
import ActivityForm from '../components/ActivityForm';
import type { CreateActivityFormData } from '../../domain/schemas/activity.schema';
import type { CreateActivityRequestDto } from '../../data/dtos/activity.dto';

/**
 * Le schema du formulaire couvre les quatre etats pour les besoins de
 * l'edition ; a la creation seuls `draft` et `published` sont proposes.
 */
const toCreatePayload = ({
  status,
  ...rest
}: CreateActivityFormData): CreateActivityRequestDto => ({
  ...rest,
  status: status === 'published' ? 'published' : 'draft',
});

export default function ProActivityCreatePage() {
  const navigate = useNavigate();
  const { createActivity, createActivityIsPending } = useCreateActivity();

  function handleSubmit(data: CreateActivityFormData) {
    createActivity(toCreatePayload(data), {
      onSuccess: () => {
        toast.success('Activité créée avec succès');
        navigate(routes.proActivityList);
      },
      onError: () => {
        toast.error('Une erreur est survenue lors de la création');
      },
    });
  }

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
                Nouvelle activité
              </h1>
              <p className="text-sm text-muted-foreground">
                Ajoutez une activité à votre catalogue
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
            onSubmit={handleSubmit}
            isPending={createActivityIsPending}
            submitLabel="Créer l'activité"
          />
        </motion.div>
      </div>
    </div>
  );
}
