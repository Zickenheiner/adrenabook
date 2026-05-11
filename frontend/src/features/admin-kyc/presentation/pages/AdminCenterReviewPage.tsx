import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/core/components/ui/alert';
import { Button } from '@/core/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Skeleton } from '@/core/components/ui/skeleton';
import routes from '@/core/constants/routes';
import { ApiError } from '@/core/errors/api.error';
import {
  usePendingCenters,
  useReviewCenter,
} from '../../domain/hooks/center-review.hook';
import type { CenterReviewFormData } from '../../domain/schemas/center-review.schema';
import CenterReviewCard from '../components/CenterReviewCard';
import CenterReviewForm from '../components/CenterReviewForm';
import CenterReviewDecisionBadge from '../components/CenterReviewDecisionBadge';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 404) return 'Ce centre est introuvable.';
    if (error.status === 409) return 'Ce dossier a déjà été traité.';
    return error.message || 'Une erreur est survenue.';
  }
  if (error instanceof Error) return error.message;
  return 'Une erreur inattendue est survenue.';
};

export default function AdminCenterReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [lastDecision, setLastDecision] = useState<
    CenterReviewFormData['decision'] | null
  >(null);

  const { pendingCenters, pendingCentersIsLoading } = usePendingCenters();
  const { reviewCenter, reviewCenterIsPending, reviewCenterIsSuccess } =
    useReviewCenter();

  const center = pendingCenters?.find((c) => c.id === id);

  const handleSubmit = (data: CenterReviewFormData) => {
    if (!id) return;
    setSubmitError(null);
    setLastDecision(data.decision);
    reviewCenter(
      { id, data },
      {
        onError: (err) => setSubmitError(err),
      },
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(routes.adminCenterList)}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Examen du dossier
              </h1>
              <p className="text-sm text-muted-foreground">ID : {id}</p>
            </div>
          </div>
        </motion.div>

        {/* Loading skeleton */}
        {pendingCentersIsLoading && (
          <div className="space-y-4">
            <Skeleton className="h-52 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        )}

        {/* Center not found */}
        {!pendingCentersIsLoading && !center && !reviewCenterIsSuccess && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Dossier introuvable</AlertTitle>
            <AlertDescription>
              Ce centre n&apos;existe pas ou n&apos;est plus en attente de
              validation.
            </AlertDescription>
          </Alert>
        )}

        {/* Success state */}
        {reviewCenterIsSuccess && lastDecision && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-success/30 bg-success/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                  <div>
                    <CardTitle className="text-base text-success">
                      Décision enregistrée
                    </CardTitle>
                    <CardDescription>
                      Le centre a été notifié de votre décision.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <CenterReviewDecisionBadge decision={lastDecision} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(routes.adminCenterList)}
                >
                  Retour à la liste
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main content */}
        {!pendingCentersIsLoading && center && !reviewCenterIsSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Center details */}
            <CenterReviewCard center={center} />

            {/* Review form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Votre décision</CardTitle>
                <CardDescription>
                  Choisissez une action pour ce dossier. Le professionnel sera
                  notifié.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {submitError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>
                      {getErrorMessage(submitError)}
                    </AlertDescription>
                  </Alert>
                )}
                <CenterReviewForm
                  onSubmit={handleSubmit}
                  isSubmitting={reviewCenterIsPending}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
