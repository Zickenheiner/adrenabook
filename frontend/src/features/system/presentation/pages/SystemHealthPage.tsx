import { motion } from 'motion/react';
import { AlertCircle, Loader2, RefreshCw, ServerCrash } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/core/components/ui/alert';
import { Button } from '@/core/components/ui/button';
import { Card, CardContent, CardHeader } from '@/core/components/ui/card';
import { Skeleton } from '@/core/components/ui/skeleton';
import { useHealth } from '../../domain/hooks/health.hook';
import HealthOverview from '../components/HealthOverview';
import HealthMetricsPanel from '../components/HealthMetricsPanel';
import HealthCheckCard from '../components/HealthCheckCard';
import type { HealthChecksEntity } from '../../domain/entities/health.entity';

const CHECK_KEYS: (keyof HealthChecksEntity)[] = [
  'mongodb',
  'stripe',
  'sendgrid',
];

export default function SystemHealthPage() {
  const {
    health,
    healthIsLoading,
    healthIsRefetching,
    healthError,
    healthRefetch,
    healthUpdatedAt,
  } = useHealth();

  if (healthIsLoading) return <SystemHealthSkeleton />;
  if (healthError && !health)
    return <SystemHealthError onRetry={() => void healthRefetch()} />;
  if (!health)
    return <SystemHealthEmpty onRetry={() => void healthRefetch()} />;

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Santé du système
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            État en temps réel des services critiques d'AdrenaBook.
            {healthUpdatedAt && (
              <>
                {' '}
                Dernière mise à jour à{' '}
                <span className="font-mono">
                  {healthUpdatedAt.toLocaleTimeString('fr-FR')}
                </span>
                .
              </>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void healthRefetch()}
          disabled={healthIsRefetching}
          className="gap-2 self-start sm:self-auto"
        >
          {healthIsRefetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Rafraîchir
        </Button>
      </motion.header>

      <HealthOverview health={health} />

      <HealthMetricsPanel health={health} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Dépendances surveillées
        </h2>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {CHECK_KEYS.map((key) => (
            <motion.div
              key={key}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <HealthCheckCard name={key} state={health.checks[key]} />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}

function SystemHealthSkeleton() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function SystemHealthError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-8 text-center sm:px-6 lg:px-8">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ServerCrash className="h-7 w-7" />
      </span>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Service indisponible</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Impossible de récupérer l'état de santé du système. Le service{' '}
          <span className="font-mono">/health</span> est peut-être hors ligne.
        </p>
      </div>
      <Alert variant="destructive" className="max-w-md text-left">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur de communication</AlertTitle>
        <AlertDescription>
          Vérifiez votre connexion ou réessayez dans quelques instants.
        </AlertDescription>
      </Alert>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Réessayer
      </Button>
    </div>
  );
}

function SystemHealthEmpty({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-8 text-center sm:px-6 lg:px-8">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <AlertCircle className="h-7 w-7" />
      </span>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Aucune donnée disponible</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          La sonde de santé n'a pas encore renvoyé de mesure.
        </p>
      </div>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Réessayer
      </Button>
    </div>
  );
}
