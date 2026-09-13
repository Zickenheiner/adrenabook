import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Users, Euro, Loader2 } from 'lucide-react';
import { fr } from 'date-fns/locale';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import { Calendar } from '@/core/components/ui/calendar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { cn } from '@/core/utils/cn';
import routes from '@/core/constants/routes';
import { useActivitySlots } from '../../domain/hooks/activity-detail.hook';
import type { ActivityDetailSlot } from '../../domain/entities/activity-detail.entity';

interface Props {
  activityId: string;
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

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
}

function SlotRow({ slot }: { slot: ActivityDetailSlot }) {
  const navigate = useNavigate();
  const isFull = slot.remainingSeats === 0;
  const isAlmostFull = slot.remainingSeats <= 3;

  return (
    <li
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border p-3',
        isFull ? 'opacity-50' : 'border-border/60',
      )}
    >
      <p className="text-sm font-medium">{formatTime(slot.startAt)}</p>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {isFull ? (
            <Badge variant="destructive" className="text-xs">
              Complet
            </Badge>
          ) : (
            <span
              className={cn(
                'text-xs',
                isAlmostFull && 'text-amber-600 font-semibold',
              )}
            >
              {slot.remainingSeats} place{slot.remainingSeats > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 font-semibold text-sm">
          <Euro className="h-3.5 w-3.5 text-muted-foreground" />
          {slot.priceEur.toLocaleString('fr-FR', {
            style: 'currency',
            currency: 'EUR',
          })}
        </div>

        <Button
          size="sm"
          disabled={isFull}
          className="shrink-0"
          onClick={() => navigate(`${routes.bookingNew}?slotId=${slot.id}`)}
        >
          Réserver
        </Button>
      </div>
    </li>
  );
}

export default function ActivitySlots({ activityId }: Props) {
  const [month, setMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();

  const monthKey = toMonthKey(month);
  const { slots, slotsAreLoading } = useActivitySlots(activityId, monthKey);

  // Les creneaux d'un meme jour sont regroupes : le calendrier raisonne par
  // jour, la liste par horaire.
  const slotsByDay = useMemo(() => {
    const map = new Map<string, ActivityDetailSlot[]>();
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

  // Ouvrir le mois sur son premier jour disponible evite d'afficher un
  // panneau vide alors que des creneaux existent.
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Créneaux disponibles</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="shrink-0">
          <Calendar
            mode="single"
            locale={fr}
            month={month}
            onMonthChange={setMonth}
            selected={selectedDay}
            onSelect={(day) => day && setSelectedDay(day)}
            disabled={(date) => !slotsByDay.has(toDayKey(date))}
            modifiers={{ available: daysWithSlots }}
            modifiersClassNames={{
              available: 'font-semibold text-primary',
            }}
            className="rounded-lg border p-2"
          />
        </div>

        <div className="min-w-0 flex-1">
          {slotsAreLoading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement des créneaux…
            </div>
          ) : slots.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
              <CalendarIcon className="h-8 w-8" />
              <p className="text-sm">
                Aucun créneau en {formatMonthLabel(monthKey)}.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm font-medium capitalize">
                {selectedDay && formatDayLabel(selectedDay)}
              </p>
              <motion.ul
                key={selectedDay?.toDateString()}
                className="space-y-2"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.04 } },
                }}
              >
                {selectedSlots.map((slot) => (
                  <motion.div
                    key={slot.id}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <SlotRow slot={slot} />
                  </motion.div>
                ))}
              </motion.ul>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
