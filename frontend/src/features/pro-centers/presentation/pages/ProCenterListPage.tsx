import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, Building2, Inbox, Plus } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Skeleton } from '@/core/components/ui/skeleton';
import routes from '@/core/constants/routes';
import { useMyCenters } from '../../domain/hooks/pro-center.hook';
import ProCenterCard from '../components/ProCenterCard';

function ProCenterListSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProCenterListError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-center text-muted-foreground">
        Une erreur est survenue lors du chargement de vos centres.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Réessayer
      </Button>
    </div>
  );
}

export default function ProCenterListPage() {
  const navigate = useNavigate();
  const { centers, centersIsLoading, centersError } = useMyCenters();

  if (centersIsLoading) return <ProCenterListSkeleton />;
  if (centersError) return <ProCenterListError />;

  const addCenter = () => navigate(routes.professionalRegister);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Mes centres</h1>
              <p className="text-sm text-muted-foreground">
                Choisissez le centre dont vous voulez gérer les activités
              </p>
            </div>
          </div>

          <Button onClick={addCenter}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un centre
          </Button>
        </motion.div>

        {!centers || centers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1 text-center">
              <p className="font-medium">Aucun centre enregistré</p>
              <p className="text-sm text-muted-foreground">
                Déclarez votre structure pour commencer à proposer des
                activités.
              </p>
            </div>
            <Button onClick={addCenter}>
              <Plus className="mr-2 h-4 w-4" />
              Enregistrer ma structure
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {centers.map((center) => (
              <ProCenterCard key={center.id} center={center} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
