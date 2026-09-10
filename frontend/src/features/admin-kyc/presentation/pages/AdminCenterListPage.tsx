import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Loader2, AlertCircle, Inbox } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/core/components/ui/alert';
import { Skeleton } from '@/core/components/ui/skeleton';
import routes from '@/core/constants/routes';
import { usePendingCenters } from '../../domain/hooks/center-review.hook';
import CenterReviewCard from '../components/CenterReviewCard';
import { Button } from '@/core/components/ui/button';

export default function AdminCenterListPage() {
  const navigate = useNavigate();
  const { pendingCenters, pendingCentersIsLoading, pendingCentersError } =
    usePendingCenters();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Validation KYC — Centres
            </h1>
            <p className="text-sm text-muted-foreground">
              Dossiers en attente de revue
            </p>
          </div>
        </motion.div>

        {/* Loading */}
        {pendingCentersIsLoading && (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Error */}
        {pendingCentersError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur de chargement</AlertTitle>
            <AlertDescription>
              Impossible de récupérer les dossiers en attente. Veuillez
              réessayer.
            </AlertDescription>
          </Alert>
        )}

        {/* Empty state */}
        {!pendingCentersIsLoading &&
          !pendingCentersError &&
          pendingCenters?.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-20 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-medium">Aucun dossier en attente</p>
              <p className="text-sm text-muted-foreground">
                Tous les centres ont été traités.
              </p>
            </motion.div>
          )}

        {/* List */}
        {!pendingCentersIsLoading &&
          pendingCenters &&
          pendingCenters.length > 0 && (
            <>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground"
              >
                {pendingCenters.length} dossier
                {pendingCenters.length > 1 ? 's' : ''} en attente
              </motion.p>

              <div className="space-y-4">
                {pendingCenters.map((center, i) => (
                  <div key={center.id} className="group relative">
                    <CenterReviewCard center={center} index={i} />
                    <div className="mt-2 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            routes.adminCenterReview.replace(':id', center.id),
                          )
                        }
                      >
                        Examiner ce dossier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        {/* Loading spinner overlay for refetch */}
        {pendingCentersIsLoading && pendingCenters && (
          <div className="flex justify-center pt-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
