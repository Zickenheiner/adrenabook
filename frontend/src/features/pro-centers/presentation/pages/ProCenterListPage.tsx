import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { AlertCircle, Building2, Inbox, Plus } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Skeleton } from '@/core/components/ui/skeleton';
import routes from '@/core/constants/routes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/core/components/ui/alert-dialog';
import { ApiError } from '@/core/errors/api.error';
import { useCenterStore } from '@/core/stores/center.store';
import {
  useDeleteCenter,
  useMyCenters,
} from '../../domain/hooks/pro-center.hook';
import type { ProCenterEntity } from '../../domain/entities/pro-center.entity';
import ProCenterCard from '../components/ProCenterCard';

function ProCenterListSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProCenterListError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-center text-muted-foreground">
        Une erreur est survenue lors du chargement de vos centres.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Réessayer
      </Button>
    </div>
  );
}

export default function ProCenterListPage() {
  const navigate = useNavigate();
  const { centers, centersIsLoading, centersError } = useMyCenters();
  const { deleteCenter, deleteCenterIsPending } = useDeleteCenter();
  const { currentCenterId, setCurrentCenterId } = useCenterStore();
  const [target, setTarget] = useState<ProCenterEntity | null>(null);

  // Le backend refuse la suppression tant que le centre porte des activites :
  // le bouton reste inactif plutot que de provoquer un 409.
  const hasActivities = (target?.activitiesCount ?? 0) > 0;

  const confirmDelete = () => {
    if (!target || hasActivities) return;
    deleteCenter(target.id, {
      onSuccess: () => {
        // Le centre courant ne doit pas rester sur un centre disparu : les
        // ecrans pro continueraient de s'y referer.
        if (currentCenterId === target.id) setCurrentCenterId(null);
        toast.success('Centre supprimé');
        setTarget(null);
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError && error.status === 409
            ? 'Supprimez d’abord les activités de ce centre.'
            : 'La suppression a échoué.',
        );
        setTarget(null);
      },
    });
  };

  if (centersIsLoading) return <ProCenterListSkeleton />;
  if (centersError) return <ProCenterListError />;

  const addCenter = () => navigate(routes.professionalRegister);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Mes centres</h1>
              <p className="text-sm text-muted-foreground">
                Choisissez le centre dont vous voulez gérer les activités
              </p>
            </div>
          </div>

          <Button onClick={addCenter}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un centre
          </Button>
        </motion.div>

        {!centers || centers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1 text-center">
              <p className="font-medium">Aucun centre enregistré</p>
              <p className="text-sm text-muted-foreground">
                Déclarez votre structure pour commencer à proposer des
                activités.
              </p>
            </div>
            <Button onClick={addCenter}>
              <Plus className="mr-2 h-4 w-4" />
              Enregistrer ma structure
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {centers.map((center) => (
              <ProCenterCard
                key={center.id}
                center={center}
                onDelete={setTarget}
              />
            ))}
          </motion.div>
        )}
      </div>

      <AlertDialog
        open={!!target}
        onOpenChange={(open) => !open && setTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce centre ?</AlertDialogTitle>
            <AlertDialogDescription>
              {hasActivities ? (
                <>
                  {target?.name} porte encore {target?.activitiesCount} activité
                  {(target?.activitiesCount ?? 0) > 1 ? 's' : ''}. Supprimez-les
                  avant de supprimer le centre.
                </>
              ) : (
                <>
                  {target?.name} sera définitivement supprimé. Cette action est
                  irréversible.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCenterIsPending}>
              {hasActivities ? 'Fermer' : 'Annuler'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteCenterIsPending || hasActivities}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
