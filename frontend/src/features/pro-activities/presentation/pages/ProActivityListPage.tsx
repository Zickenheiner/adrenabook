import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Inbox, Plus, Activity } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Skeleton } from '@/core/components/ui/skeleton';
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
import routes from '@/core/constants/routes';
import {
  useActivityList,
  useDeleteActivity,
} from '../../domain/hooks/activity.hook';
import ActivityCard from '../components/ActivityCard';

function ProActivityListSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProActivityListError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-muted-foreground text-center">
        Une erreur est survenue lors du chargement des activités.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Réessayer
      </Button>
    </div>
  );
}

function ProActivityListEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="text-center space-y-1">
        <p className="font-medium">Aucune activité pour le moment</p>
        <p className="text-sm text-muted-foreground">
          Créez votre première activité pour attirer des participants.
        </p>
      </div>
      <Button onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Créer une activité
      </Button>
    </div>
  );
}

export default function ProActivityListPage() {
  const navigate = useNavigate();
  const { activities, activitiesIsLoading, activitiesError } =
    useActivityList();
  const { deleteActivity, deleteActivityIsPending } = useDeleteActivity();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  if (activitiesIsLoading) return <ProActivityListSkeleton />;
  if (activitiesError) return <ProActivityListError />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Catalogue d&apos;activités
              </h1>
              <p className="text-sm text-muted-foreground">
                {activities?.length
                  ? `${activities.length} activité${activities.length > 1 ? 's' : ''}`
                  : 'Gérez vos activités proposées'}
              </p>
            </div>
          </div>

          <Button onClick={() => navigate(routes.proActivityCreate)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle activité
          </Button>
        </motion.div>

        {/* Content */}
        {!activities?.length ? (
          <ProActivityListEmpty
            onAdd={() => navigate(routes.proActivityCreate)}
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.06 } },
            }}
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onManageSlots={(id) =>
                    navigate(routes.proSlotManage.replace(':id', id))
                  }
                  onDelete={(id) => setDeleteTargetId(id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Confirmation suppression */}
      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette activité ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;activité sera définitivement
              supprimée du catalogue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteActivityIsPending}
              onClick={() => {
                if (deleteTargetId) {
                  deleteActivity(deleteTargetId);
                  setDeleteTargetId(null);
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
