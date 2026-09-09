import { Calendar, Clock, Euro, Timer, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Separator } from '@/core/components/ui/separator';
import type { SlotDetailEntity } from '../../domain/entities/slot-detail.entity';

interface Props {
  slot: SlotDetailEntity;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}

export default function BookingSlotSummary({ slot }: Props) {
  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Créneau sélectionné</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Separator />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              {slot.startAt.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              {slot.startAt.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer className="h-4 w-4 shrink-0" />
            <span>{formatDuration(slot.durationMinutes)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              {slot.remainingSeats} place{slot.remainingSeats > 1 ? 's' : ''}{' '}
              disponible
              {slot.remainingSeats > 1 ? 's' : ''} sur {slot.maxParticipants}
            </span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Euro className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              {slot.priceEur.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              })}{' '}
              / pers.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
