import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Progress } from '@/core/components/ui/progress';
import { Separator } from '@/core/components/ui/separator';
import { Clock, GitBranch, Timer } from 'lucide-react';
import type { HealthEntity } from '../../domain/entities/health.entity';

interface Props {
  health: HealthEntity;
}

const SECONDS_IN_DAY = 60 * 60 * 24;
const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_MINUTE = 60;

function formatUptime(seconds: number): string {
  if (seconds < 0 || Number.isNaN(seconds)) return '—';

  const days = Math.floor(seconds / SECONDS_IN_DAY);
  const hours = Math.floor((seconds % SECONDS_IN_DAY) / SECONDS_IN_HOUR);
  const minutes = Math.floor((seconds % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}j`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}min`);

  return parts.join(' ');
}

function getResponseTimeQuality(ms: number): {
  label: string;
  percent: number;
  toneClass: string;
} {
  if (ms <= 100) {
    return {
      label: 'Excellent',
      percent: 100,
      toneClass: 'text-emerald-600 dark:text-emerald-400',
    };
  }
  if (ms <= 300) {
    return {
      label: 'Bon',
      percent: 75,
      toneClass: 'text-emerald-600 dark:text-emerald-400',
    };
  }
  if (ms <= 800) {
    return {
      label: 'Acceptable',
      percent: 45,
      toneClass: 'text-amber-600 dark:text-amber-400',
    };
  }
  return {
    label: 'Lent',
    percent: 15,
    toneClass: 'text-destructive',
  };
}

export default function HealthMetricsPanel({ health }: Props) {
  const responseQuality = getResponseTimeQuality(health.responseTimeMs);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Métriques système</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GitBranch className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Version
              </p>
              <p
                className="mt-1 truncate font-mono text-sm font-semibold"
                title={health.version}
              >
                {health.version || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Clock className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Uptime
              </p>
              <p className="mt-1 text-sm font-semibold">
                {formatUptime(health.uptime)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Timer className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Réponse
              </p>
              <p className="mt-1 text-sm font-semibold">
                {health.responseTimeMs} ms
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Qualité de la réponse</span>
            <span className={responseQuality.toneClass + ' font-medium'}>
              {responseQuality.label}
            </span>
          </div>
          <Progress value={responseQuality.percent} className="h-2" />
        </div>

        <p className="text-xs text-muted-foreground">
          Mesuré à {health.checkedAt.toLocaleTimeString('fr-FR')}
        </p>
      </CardContent>
    </Card>
  );
}
