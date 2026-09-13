import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, CalendarCheck, Inbox, Search } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Skeleton } from '@/core/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import { Badge } from '@/core/components/ui/badge';
import routes from '@/core/constants/routes';
import { useMyBookings } from '../../domain/hooks/my-booking.hook';
import MyBookingCard from '../components/MyBookingCard';
import type { MyBookingEntity } from '../../domain/entities/my-booking.entity';

type Filter = 'upcoming' | 'past' | 'cancelled';

function MyBookingsSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <Skeleton className="h-8 w-56" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
}

function MyBookingsError() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-center text-muted-foreground">
        Une erreur est survenue lors du chargement de vos réservations.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Réessayer
      </Button>
    </div>
  );
}

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { bookings, bookingsIsLoading, bookingsError } = useMyBookings();
  const [filter, setFilter] = useState<Filter>('upcoming');

  const groups = useMemo(() => {
    const now = Date.now();
    const all = bookings ?? [];

    // Une réservation annulée sort des deux autres listes : elle n'a plus rien
    // à préparer, ni de sortie à venir.
    const cancelled = all.filter((b) => b.status === 'cancelled');
    const active = all.filter((b) => b.status !== 'cancelled');

    return {
      upcoming: active
        .filter((b) => b.startAt.getTime() >= now)
        .sort((a, b) => a.startAt.getTime() - b.startAt.getTime()),
      past: active.filter((b) => b.startAt.getTime() < now),
      cancelled,
    } satisfies Record<Filter, MyBookingEntity[]>;
  }, [bookings]);

  if (bookingsIsLoading) return <MyBookingsSkeleton />;
  if (bookingsError) return <MyBookingsError />;

  const shown = groups[filter];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
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
          <h1 className="text-xl font-bold tracking-tight">Mes réservations</h1>
          <p className="text-sm text-muted-foreground">
            Retrouvez vos sorties, payez, signez vos décharges et vos factures
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
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1 text-center">
            <p className="font-medium">
              {filter === 'upcoming'
                ? 'Aucune sortie à venir'
                : filter === 'past'
                  ? 'Aucune sortie passée'
                  : 'Aucune réservation annulée'}
            </p>
            {filter === 'upcoming' && (
              <p className="text-sm text-muted-foreground">
                Trouvez une activité et réservez votre prochaine aventure.
              </p>
            )}
          </div>
          {filter === 'upcoming' && (
            <Button onClick={() => navigate(routes.activitySearch)}>
              <Search className="mr-2 h-4 w-4" />
              Chercher une activité
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-4"
        >
          {shown.map((booking) => (
            <MyBookingCard key={booking.bookingId} booking={booking} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
