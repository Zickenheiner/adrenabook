import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, ArrowLeft, CalendarClock, CalendarX } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Separator } from '@/core/components/ui/separator';
import { Skeleton } from '@/core/components/ui/skeleton';
import routes from '@/core/constants/routes';
import { useCreateSlots, useProSlots } from '../../domain/hooks/slot.hook';
import type { CreateSlotRequestDto } from '../../data/dtos/slot.dto';
import SlotForm from '../components/SlotForm';
import SlotCard, { SlotConflictCard } from '../components/SlotCard';

export default function ProSlotManagePage() {
  const navigate = useNavigate();
  const { id: activityId } = useParams<{ id: string }>();
  const {
    createSlots,
    createSlotsIsPending,
    createSlotsError,
    createSlotsResult,
  } = useCreateSlots(activityId ?? '');
  const { slots, slotsIsLoading, slotsError } = useProSlots(activityId ?? '');

  const existingSlots = slots
    ? [...slots].sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    : [];

  function handleSubmit(data: CreateSlotRequestDto) {
    if (!activityId) return;
    createSlots(data);
  }

  if (!activityId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground text-center">
          Aucune activité sélectionnée.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate(routes.proActivityList)}
        >
          Retour au catalogue
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
            onClick={() => navigate(routes.proActivityList)}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au catalogue
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
          <SlotForm onSubmit={handleSubmit} isPending={createSlotsIsPending} />
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

          {slotsIsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-[70px] w-full rounded-xl" />
              <Skeleton className="h-[70px] w-full rounded-xl" />
              <Skeleton className="h-[70px] w-full rounded-xl" />
            </div>
          ) : slotsError ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                {(slotsError as Error).message ||
                  'Les créneaux existants n’ont pas pu être chargés.'}
              </span>
            </div>
          ) : existingSlots.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-center">
              <CalendarX className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                Aucun créneau pour cette activité
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Utilisez le formulaire ci-dessus pour créer votre premier
                créneau, ponctuel ou récurrent.
              </p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
              className="space-y-2"
            >
              {existingSlots.map((slot, index) => (
                <SlotCard key={slot.id} slot={slot} index={index} />
              ))}
            </motion.div>
          )}
        </section>

        {/* Résultat de la création */}
        {createSlotsResult && (
          <>
            <Separator />
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-base font-semibold">
                  {createSlotsResult.createdCount} créneau
                  {createSlotsResult.createdCount > 1 ? 'x' : ''} créé
                  {createSlotsResult.createdCount > 1 ? 's' : ''}
                </h2>
                {createSlotsResult.slots.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {createSlotsResult.slots.map((slot, index) => (
                      <SlotCard key={slot.id} slot={slot} index={index} />
                    ))}
                  </div>
                )}
              </div>

              {createSlotsResult.conflicts.length > 0 && (
                <div>
                  <h2 className="text-base font-semibold">
                    {createSlotsResult.conflicts.length} conflit
                    {createSlotsResult.conflicts.length > 1 ? 's' : ''} ignoré
                    {createSlotsResult.conflicts.length > 1 ? 's' : ''}
                  </h2>
                  <div className="mt-3 space-y-2">
                    {createSlotsResult.conflicts.map((conflict, index) => (
                      <SlotConflictCard
                        key={`${conflict.startAt.toISOString()}-${index}`}
                        startAt={conflict.startAt}
                        reason={conflict.reason}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
