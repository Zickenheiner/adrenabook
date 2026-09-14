import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { AlertCircle, ArrowLeft, CalendarClock } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Separator } from '@/core/components/ui/separator';
import { Skeleton } from '@/core/components/ui/skeleton';
import routes from '@/core/constants/routes';
import { useCenterStore } from '@/core/stores/center.store';
import { useCreateSlots } from '../../domain/hooks/slot.hook';
// La duree et le prix du creneau sont ceux de l'activite : on les lit a la
// source plutot que de les ressaisir.
import { useActivity } from '@/features/pro-activities/domain/hooks/activity.hook';
import type { CreateSlotRequestDto } from '../../data/dtos/slot.dto';
import SlotForm from '../components/SlotForm';
import SlotCalendar from '../components/SlotCalendar';

export default function ProSlotManagePage() {
  const navigate = useNavigate();
  const { id: activityId } = useParams<{ id: string }>();
  const currentCenterId = useCenterStore((state) => state.currentCenterId);

  // Le creneau ne connait que son activite : le centre d'ou vient le
  // professionnel est celui qu'il a selectionne. A defaut, la liste des
  // centres reste le seul repli possible.
  const backToActivities = () =>
    navigate(
      currentCenterId
        ? routes.proActivityList.replace(':centerId', currentCenterId)
        : routes.proCenterList,
    );
  const {
    createSlots,
    createSlotsIsPending,
    createSlotsError,
    createSlotsResult,
  } = useCreateSlots(activityId ?? '');
  const { activity, activityIsLoading } = useActivity(activityId ?? '');

  // Les creneaux crees tombent souvent hors du mois consulte : on y amene le
  // calendrier pour que le professionnel voie le resultat de son ajout.
  const focusMonth = createSlotsResult?.slots.length
    ? new Date(createSlotsResult.slots[0].startAt)
    : null;

  function handleSubmit(data: CreateSlotRequestDto) {
    if (!activityId) return;
    // Les creneaux crees apparaissent dans le calendrier : seul le compte est
    // annonce, et les conflits ignores qui eux n'y figurent pas.
    createSlots(data, {
      onSuccess: (result) => {
        toast.success(
          `${result.createdCount} créneau${result.createdCount > 1 ? 'x' : ''} créé${result.createdCount > 1 ? 's' : ''}`,
        );
        if (result.conflicts.length > 0) {
          toast.warning(
            `${result.conflicts.length} créneau${result.conflicts.length > 1 ? 'x' : ''} ignoré${result.conflicts.length > 1 ? 's' : ''} (conflit)`,
          );
        }
      },
    });
  }

  if (!activityId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground text-center">
          Aucune activité sélectionnée.
        </p>
        <Button variant="outline" onClick={backToActivities}>
          Retour aux activités
        </Button>
      </div>
    );
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
            onClick={backToActivities}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux activités
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Gestion des créneaux
              </h1>
              <p className="text-sm text-muted-foreground">
                Ajoutez des créneaux ponctuels ou récurrents à cette activité
              </p>
            </div>
          </div>
        </motion.div>

        <Separator />

        {/* Formulaire de création */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {activityIsLoading || !activity ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : (
            <SlotForm
              onSubmit={handleSubmit}
              isPending={createSlotsIsPending}
              activityDurationMinutes={activity.durationMinutes}
              activityPriceEur={activity.priceEur}
            />
          )}
        </motion.div>

        {/* Erreur API */}
        {createSlotsError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              {(createSlotsError as Error).message ||
                'Une erreur est survenue lors de la création des créneaux.'}
            </span>
          </div>
        )}

        <Separator />

        {/* Créneaux existants */}
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold">Créneaux existants</h2>
            <p className="text-sm text-muted-foreground">
              Les créneaux déjà planifiés pour cette activité, avec leurs places
              restantes.
            </p>
          </div>

          <SlotCalendar activityId={activityId} focusMonth={focusMonth} />
        </section>
      </div>
    </div>
  );
}
