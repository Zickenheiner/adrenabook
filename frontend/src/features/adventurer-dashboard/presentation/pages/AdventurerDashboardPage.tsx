import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Map,
  AlertCircle,
  Inbox,
  Calendar,
  Compass,
} from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Skeleton } from '@/core/components/ui/skeleton';
import { Separator } from '@/core/components/ui/separator';
import routes from '@/core/constants/routes';
import { useDashboard } from '../../domain/hooks/dashboard.hook';
import DashboardWelcomeHeader from '../components/DashboardWelcomeHeader';
import UpcomingBookingCard from '../components/UpcomingBookingCard';
import SuggestedActivityCard from '../components/SuggestedActivityCard';

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-52" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-52" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardError() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center gap-4 min-h-[50vh]">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-muted-foreground text-center">
        Impossible de charger votre tableau de bord. Veuillez réessayer.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Réessayer
      </Button>
    </div>
  );
}

const staggerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function AdventurerDashboardPage() {
  const { dashboard, dashboardIsLoading, dashboardError } = useDashboard();
  const navigate = useNavigate();

  if (dashboardIsLoading) return <DashboardSkeleton />;
  if (dashboardError) return <DashboardError />;
  if (!dashboard) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Welcome Header */}
      <DashboardWelcomeHeader firstName={dashboard.firstName} />

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="flex flex-wrap gap-3"
      >
        <Button onClick={() => navigate(routes.activitySearch)}>
          <Search className="mr-2 h-4 w-4" />
          Rechercher une activité
        </Button>
        <Button variant="outline" onClick={() => navigate(routes.centerMap)}>
          <Map className="mr-2 h-4 w-4" />
          Voir la carte
        </Button>
      </motion.div>

      <Separator />

      {/* Upcoming Bookings */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Prochaines réservations</h2>
        </div>

        {dashboard.upcomingBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center"
          >
            <Inbox className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              Aucune réservation à venir pour le moment.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(routes.activitySearch)}
            >
              Découvrir des activités
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {dashboard.upcomingBookings.map((booking) => (
              <motion.div key={booking.bookingId} variants={itemVariants}>
                <UpcomingBookingCard booking={booking} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <Separator />

      {/* Suggested Activities */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Activités suggérées</h2>
        {dashboard.suggestedActivities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center"
          >
            <Compass className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              Aucune activité suggérée pour le moment.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(routes.activitySearch)}
            >
              Découvrir les activités
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
          >
            {dashboard.suggestedActivities.map((activity) => (
              <motion.div key={activity.id} variants={itemVariants}>
                <SuggestedActivityCard activity={activity} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
