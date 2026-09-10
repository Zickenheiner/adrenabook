import { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  BarChart3,
  Euro,
  ShoppingBag,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Skeleton } from '@/core/components/ui/skeleton';
import { Separator } from '@/core/components/ui/separator';
import type { DashboardQueryDto } from '../../data/dtos/dashboard.dto';
import { useDashboard } from '../../domain/hooks/dashboard.hook';
import DashboardRangeSelector from '../components/DashboardRangeSelector';
import KpiCard from '../components/KpiCard';
import RevenueChart from '../components/RevenueChart';
import TopActivitiesList from '../components/TopActivitiesList';

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPct(value: number): string {
  return `${value.toFixed(1)} %`;
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-10 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function DashboardError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-muted-foreground text-center">
        Une erreur est survenue lors du chargement du tableau de bord.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Réessayer
      </Button>
    </div>
  );
}

export default function ProDashboardPage() {
  const [range, setRange] = useState<DashboardQueryDto['range']>('month');
  const { dashboard, dashboardIsLoading, dashboardError } = useDashboard({
    range,
  });

  if (dashboardIsLoading) return <DashboardSkeleton />;
  if (dashboardError) return <DashboardError />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Tableau de bord
              </h1>
              <p className="text-sm text-muted-foreground">
                Pilotez votre activité
              </p>
            </div>
          </div>
          <DashboardRangeSelector value={range} onChange={setRange} />
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {[
            {
              title: "Chiffre d'affaires",
              value: dashboard ? formatEur(dashboard.revenue.totalEur) : '—',
              trend: dashboard?.revenue.vsPreviousPeriod,
              icon: Euro,
            },
            {
              title: 'Taux de remplissage',
              value: dashboard ? formatPct(dashboard.occupancyRate) : '—',
              icon: Users,
            },
            {
              title: 'Panier moyen',
              value: dashboard ? formatEur(dashboard.averageBasketEur) : '—',
              icon: ShoppingBag,
            },
            {
              title: "Taux d'annulation",
              value: dashboard
                ? formatPct(dashboard.bookings.cancellationRate)
                : '—',
              icon: XCircle,
            },
          ].map((kpi) => (
            <motion.div
              key={kpi.title}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <KpiCard
                title={kpi.title}
                value={kpi.value}
                trend={kpi.trend}
                icon={kpi.icon}
                className="h-full"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Charts row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid gap-4 lg:grid-cols-2"
        >
          {/* Revenue chart */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Évolution du CA
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart series={dashboard?.revenue.series ?? []} />
            </CardContent>
          </Card>

          {/* Bookings summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Réservations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Confirmées
                </span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {dashboard?.bookings.confirmed ?? '—'}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Annulées</span>
                <span className="text-sm font-semibold text-destructive">
                  {dashboard?.bookings.cancelled ?? '—'}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Taux d&apos;annulation
                </span>
                <span className="text-sm font-semibold">
                  {dashboard
                    ? formatPct(dashboard.bookings.cancellationRate)
                    : '—'}
                </span>
              </div>
              {dashboard && (
                <div className="pt-1">
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{
                        width: `${Math.min(100, 100 - dashboard.bookings.cancellationRate)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground text-right">
                    {formatPct(100 - dashboard.bookings.cancellationRate)}{' '}
                    confirmées
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Activities */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Top activités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TopActivitiesList activities={dashboard?.topActivities ?? []} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
