import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CalendarCheck, Inbox, Users } from 'lucide-react';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import { Card } from '@/core/components/ui/card';
import { Skeleton } from '@/core/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import { cn } from '@/core/utils/cn';
import { useCenterStore } from '@/core/stores/center.store';
import { useCenterBookings } from '../../domain/hooks/pro-booking.hook';
import type {
  ProBookingEntity,
  ProBookingStatus,
} from '../../domain/entities/pro-booking.entity';

type Filter = 'upcoming' | 'past' | 'cancelled';

const STATUS: Record<ProBookingStatus, { label: string; className: string }> = {
  pending_payment: {
    label: 'En attente de paiement',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  },
  partial_paid: {
    label: 'Partiellement réglée',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  },
  confirmed: {
    label: 'Confirmée',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  },
  cancelled: {
    label: 'Annulée',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
};

function ProBookingsSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
      <Skeleton className="h-8 w-56" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

function ProBookingsError() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-center text-muted-foreground">
        Une erreur est survenue lors du chargement des réservations.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Réessayer
      </Button>
    </div>
  );
}

function BookingRow({ booking }: { booking: ProBookingEntity }) {
  const status = STATUS[booking.status];

  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="font-semibold">{booking.activityTitle}</h3>
          <p className="text-sm text-muted-foreground">
            {booking.startAt.toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}{' '}
            à{' '}
            {booking.startAt.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn('shrink-0 text-xs', status?.className)}
        >
          {status?.label ?? booking.status}
        </Badge>
      </div>

      <div className="grid gap-1.5 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Client</p>
          <p className="font-medium">{booking.customerName || '—'}</p>
          {booking.customerEmail && (
            <p className="text-xs text-muted-foreground">
              {booking.customerEmail}
            </p>
          )}
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {booking.participants} participant
            {booking.participants > 1 ? 's' : ''}
          </p>
          {/* Les noms annoncés servent à l'accueil le jour de la sortie. */}
          {booking.participantNames.length > 0 && (
            <p className="text-sm">{booking.participantNames.join(', ')}</p>
          )}
        </div>
      </div>

      <p className="text-sm">
        <span className="font-semibold">
          {booking.totalEur.toLocaleString('fr-FR', {
            style: 'currency',
            currency: 'EUR',
          })}
        </span>
        {booking.paidAmountEur < booking.totalEur && (
          <span className="text-muted-foreground">
            {' '}
            — réglé{' '}
            {booking.paidAmountEur.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </span>
        )}
      </p>
    </Card>
  );
}

export default function ProBookingsPage() {
  const centerId = useCenterStore((state) => state.currentCenterId) ?? '';
  const { bookings, bookingsIsLoading, bookingsError } =
    useCenterBookings(centerId);
  const [filter, setFilter] = useState<Filter>('upcoming');

  const groups = useMemo(() => {
    const now = Date.now();
    const all = bookings ?? [];
    const cancelled = all.filter((b) => b.status === 'cancelled');
    const active = all.filter((b) => b.status !== 'cancelled');

    return {
      upcoming: active
        .filter((b) => b.startAt.getTime() >= now)
        .sort((a, b) => a.startAt.getTime() - b.startAt.getTime()),
      past: active.filter((b) => b.startAt.getTime() < now),
      cancelled,
    } satisfies Record<Filter, ProBookingEntity[]>;
  }, [bookings]);

  if (bookingsIsLoading) return <ProBookingsSkeleton />;
  if (bookingsError) return <ProBookingsError />;

  const shown = groups[filter];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <CalendarCheck className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Réservations</h1>
          <p className="text-sm text-muted-foreground">
            Les réservations prises sur les activités de ce centre
          </p>
        </div>
      </motion.div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-1.5">
            À venir
            {groups.upcoming.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {groups.upcoming.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Passées</TabsTrigger>
          <TabsTrigger value="cancelled">Annulées</TabsTrigger>
        </TabsList>
      </Tabs>

      {shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium">
            {filter === 'upcoming'
              ? 'Aucune réservation à venir'
              : filter === 'past'
                ? 'Aucune réservation passée'
                : 'Aucune réservation annulée'}
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-3"
        >
          {shown.map((booking) => (
            <BookingRow key={booking.bookingId} booking={booking} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
