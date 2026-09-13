import { useEffect, useMemo, useState } from 'react';
import { CalendarX, AlertCircle, Loader2 } from 'lucide-react';
import { fr } from 'date-fns/locale';
import { motion } from 'motion/react';
import { Calendar } from '@/core/components/ui/calendar';
import { useProSlots } from '../../domain/hooks/slot.hook';
import type { ProSlotEntity } from '../../domain/entities/slot.entity';
import SlotCard from './SlotCard';

interface Props {
  activityId: string;
  /**
   * Mois a afficher, impose de l'exterieur apres une creation : les nouveaux
   * creneaux tombent souvent hors du mois consulte.
   */
  focusMonth?: Date | null;
}

/** Mois au format YYYY-MM, cle d'echange avec l'API. */
function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function toDayKey(date: Date): string {
  return date.toDateString();
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
}

export default function SlotCalendar({ activityId, focusMonth }: Props) {
  const [month, setMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();

  // Une creation ailleurs dans la page deplace le calendrier sur le mois
  // concerne, sinon les creneaux crees resteraient invisibles.
  useEffect(() => {
    if (focusMonth) setMonth(focusMonth);
  }, [focusMonth]);

  const monthKey = toMonthKey(month);
  const { slots, slotsIsLoading, slotsError } = useProSlots(
    activityId,
    monthKey,
  );

  // Le calendrier raisonne par jour, la liste par horaire.
  const slotsByDay = useMemo(() => {
    const map = new Map<string, ProSlotEntity[]>();
    for (const slot of slots) {
      const key = toDayKey(slot.startAt);
      map.set(key, [...(map.get(key) ?? []), slot]);
    }
    return map;
  }, [slots]);

  const daysWithSlots = useMemo(
    () => slots.map((slot) => slot.startAt),
    [slots],
  );

  // Ouvrir le mois sur son premier jour occupe evite un panneau vide alors
  // que des creneaux existent.
  useEffect(() => {
    if (slots.length === 0) {
      setSelectedDay(undefined);
      return;
    }
    setSelectedDay((current) =>
      current && slotsByDay.has(toDayKey(current)) ? current : slots[0].startAt,
    );
  }, [slots, slotsByDay]);

  const selectedSlots = selectedDay
    ? (slotsByDay.get(toDayKey(selectedDay)) ?? [])
    : [];

  if (slotsError) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <Calendar
        mode="single"
        locale={fr}
        month={month}
        onMonthChange={setMonth}
        selected={selectedDay}
        onSelect={(day) => day && setSelectedDay(day)}
        disabled={(date) => !slotsByDay.has(toDayKey(date))}
        modifiers={{ booked: daysWithSlots }}
        modifiersClassNames={{ booked: 'font-semibold text-primary' }}
        className="shrink-0 rounded-lg border p-2"
      />

      <div className="min-w-0 flex-1">
        {slotsIsLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement des créneaux…
          </div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <CalendarX className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Aucun créneau en {formatMonthLabel(monthKey)}
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Changez de mois, ou utilisez le formulaire ci-dessus pour en
              créer.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm font-medium capitalize">
              {selectedDay && formatDayLabel(selectedDay)}
            </p>
            <motion.div
              key={selectedDay?.toDateString()}
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
              className="space-y-2"
            >
              {selectedSlots.map((slot, index) => (
                <SlotCard key={slot.id} slot={slot} index={index} />
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
