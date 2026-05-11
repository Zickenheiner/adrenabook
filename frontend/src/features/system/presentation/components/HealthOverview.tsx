import { motion } from 'motion/react';
import { Activity } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { cn } from '@/core/utils/cn';
import HealthStatusBadge from './HealthStatusBadge';
import type { HealthEntity } from '../../domain/entities/health.entity';

interface Props {
  health: HealthEntity;
}

const STATUS_MESSAGES: Record<HealthEntity['status'], string> = {
  ok: 'Tous les services répondent normalement.',
  degraded:
    'Au moins un service présente une anomalie. Le service global reste accessible.',
  down: 'Le service est indisponible. Les sondes Kubernetes retourneront 503.',
};

const STATUS_GLOW: Record<HealthEntity['status'], string> = {
  ok: 'bg-emerald-500/10',
  degraded: 'bg-amber-500/10',
  down: 'bg-destructive/15',
};

export default function HealthOverview({ health }: Props) {
  const failingChecks = Object.entries(health.checks)
    .filter(([, state]) => state === 'fail')
    .map(([name]) => name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden">
        <span
          className={cn(
            'absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl',
            STATUS_GLOW[health.status],
          )}
          aria-hidden="true"
        />
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Activity className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-lg">Statut global</CardTitle>
                <CardDescription>
                  Synthèse des dépendances de production
                </CardDescription>
              </div>
            </div>
            <HealthStatusBadge status={health.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {STATUS_MESSAGES[health.status]}
          </p>
          {failingChecks.length > 0 && (
            <p className="text-sm">
              <span className="font-medium text-destructive">
                Services en échec :
              </span>{' '}
              <span className="font-mono text-xs">
                {failingChecks.join(', ')}
              </span>
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
