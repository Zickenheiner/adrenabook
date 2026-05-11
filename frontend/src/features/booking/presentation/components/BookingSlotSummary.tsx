import { Calendar, Clock, Euro, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Separator } from '@/core/components/ui/separator';

interface Props {
  slotId: string;
  startAt: Date;
  priceEur: number;
  remainingSeats: number;
  activityTitle: string;
}

export default function BookingSlotSummary({
  slotId: _slotId,
  startAt,
  priceEur,
  remainingSeats,
  activityTitle,
}: Props) {
  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Créneau sélectionné</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-medium text-sm">{activityTitle}</p>
        <Separator />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              {startAt.toLocaleDateString('fr-FR', {
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
              {startAt.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              {remainingSeats} place{remainingSeats > 1 ? 's' : ''} disponible
              {remainingSeats > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Euro className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              {priceEur.toLocaleString('fr-FR', {
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
