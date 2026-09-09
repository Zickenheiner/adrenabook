import { motion } from 'motion/react';
import { Card, CardContent } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { Calendar, Clock, Users } from 'lucide-react';
import type {
  ProSlotEntity,
  SlotSummaryEntity,
} from '../../domain/entities/slot.entity';

interface Props {
  /** Créneau minimal (résultat de création) ou créneau détaillé (liste existante) */
  slot: SlotSummaryEntity | ProSlotEntity;
  index?: number;
}

function isDetailedSlot(
  slot: SlotSummaryEntity | ProSlotEntity,
): slot is ProSlotEntity {
  return 'remainingSeats' in slot;
}

function formatPrice(priceEur: number): string {
  return priceEur.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SlotCard({ slot, index = 0 }: Props) {
  const detailed = isDetailedSlot(slot) ? slot : null;
  const isFull = detailed ? detailed.remainingSeats === 0 : false;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <Card className="border border-border/60 hover:border-border transition-colors">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{formatDate(slot.startAt)}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(slot.startAt)}
                {detailed && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{detailed.durationMinutes} min</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatPrice(detailed.priceEur)}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          {detailed ? (
            <Badge
              variant={isFull ? 'destructive' : 'secondary'}
              className="text-xs shrink-0"
            >
              <Users className="mr-1 h-3 w-3" />
              {isFull
                ? 'Complet'
                : `${detailed.remainingSeats}/${detailed.maxParticipants} places restantes`}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs shrink-0">
              #{slot.id.slice(0, 8)}
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface SlotConflictCardProps {
  startAt: Date;
  reason: string;
  index?: number;
}

export function SlotConflictCard({
  startAt,
  reason,
  index = 0,
}: SlotConflictCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <Card className="border border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 shrink-0">
              <Calendar className="h-4 w-4 text-destructive" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{formatDate(startAt)}</p>
              <p className="text-xs text-muted-foreground">
                {formatTime(startAt)}
              </p>
            </div>
          </div>
          <Badge
            variant="destructive"
            className="text-xs shrink-0 max-w-[150px] truncate"
          >
            {reason}
          </Badge>
        </CardContent>
      </Card>
    </motion.div>
  );
}
