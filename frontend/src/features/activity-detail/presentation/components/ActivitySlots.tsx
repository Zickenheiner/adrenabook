import { Calendar, Users, Euro } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { cn } from '@/core/utils/cn';
import type { ActivityDetailSlot } from '../../domain/entities/activity-detail.entity';

interface Props {
  slots: ActivityDetailSlot[];
}

function formatSlotDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
}

function formatSlotTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ActivitySlots({ slots }: Props) {
  if (slots.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Créneaux disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <Calendar className="h-8 w-8" />
            <p className="text-sm">
              Aucun créneau disponible dans les 90 prochains jours
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Créneaux disponibles
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            (90 prochains jours)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.ul
          className="space-y-2"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {slots.map((slot) => {
            const isAlmostFull = slot.remainingSeats <= 3;
            const isFull = slot.remainingSeats === 0;

            return (
              <motion.li
                key={slot.id}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  visible: { opacity: 1, y: 0 },
                }}
                className={cn(
                  'flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3',
                  isFull ? 'opacity-50' : 'border-border/60',
                )}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {formatSlotDate(slot.startAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatSlotTime(slot.startAt)}
                    </p>
                  </div>
                </div>

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
                        {slot.remainingSeats} place
                        {slot.remainingSeats > 1 ? 's' : ''}
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

                  <Button size="sm" disabled={isFull} className="shrink-0">
                    Réserver
                  </Button>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </CardContent>
    </Card>
  );
}
