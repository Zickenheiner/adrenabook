import { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface Props {
  /** `null` quand la réservation n'a plus de délai d'expiration (déjà payée, annulée…) */
  expiresAt: Date | null;
  onExpire?: () => void;
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function BookingTimer({ expiresAt, onExpire }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!expiresAt) return;

    if (secondsLeft <= 0) {
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire, secondsLeft]);

  // Aucun délai d'expiration à afficher : on ne rend pas de minuteur trompeur.
  if (!expiresAt) return null;

  const isUrgent = secondsLeft <= 120; // moins de 2 min
  const isExpired = secondsLeft === 0;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium',
        isExpired
          ? 'border-destructive/40 bg-destructive/10 text-destructive'
          : isUrgent
            ? 'border-amber-400/50 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
            : 'border-border bg-muted/40 text-muted-foreground',
      )}
    >
      {isExpired ? (
        <AlertCircle className="h-4 w-4 shrink-0" />
      ) : (
        <Clock
          className={cn('h-4 w-4 shrink-0', isUrgent && 'animate-pulse')}
        />
      )}
      {isExpired ? (
        <span>Réservation expirée</span>
      ) : (
        <span>
          Places réservées pour{' '}
          <span className={cn('tabular-nums', isUrgent && 'font-bold')}>
            {formatCountdown(secondsLeft)}
          </span>
        </span>
      )}
    </div>
  );
}
