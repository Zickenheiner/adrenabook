import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, Mountain } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/core/components/ui/alert';
import routes from '@/core/constants/routes';
import { ApiError } from '@/core/errors/api.error';
import { useProfessionalRegistration } from '../../domain/hooks/professional-registration.hook';
import ProfessionalRegistrationForm from '../components/ProfessionalRegistrationForm';
import type { ProfessionalRegistrationFormData } from '../../domain/schemas/professional-registration.schema';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 409)
      return 'Un centre existe déjà avec ce numéro SIRET.';
    if (error.status === 400)
      return 'Certaines informations sont invalides. Vérifiez vos données.';
    return error.message || 'Une erreur est survenue lors de la soumission.';
  }
  if (error instanceof Error) return error.message;
  return 'Une erreur inattendue est survenue.';
};

export default function ProfessionalRegistrationPage() {
  const navigate = useNavigate();
  const {
    registerProfessionalAsync,
    registerProfessionalIsLoading,
    registerProfessionalError,
  } = useProfessionalRegistration();
  const [submitError, setSubmitError] = useState<unknown>(null);

  const handleSubmit = async (data: ProfessionalRegistrationFormData) => {
    setSubmitError(null);
    try {
      const result = await registerProfessionalAsync(data);
      navigate(routes.professionalRegisterSuccess, {
        state: {
          centerId: result.centerId,
          estimatedReviewTime: result.estimatedReviewTime,
        },
      });
    } catch (err) {
      setSubmitError(err);
    }
  };

  const error = submitError ?? registerProfessionalError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Mountain className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">AdrenaBook</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Inscription Centre Professionnel
            </CardTitle>
            <CardDescription>
              Rejoignez notre réseau de centres outdoor certifiés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{getErrorMessage(error)}</AlertDescription>
              </Alert>
            )}

            <ProfessionalRegistrationForm
              onSubmit={handleSubmit}
              isSubmitting={registerProfessionalIsLoading}
            />

            <p className="text-center text-sm text-muted-foreground">
              Déjà inscrit ?{' '}
              <Link
                to={routes.login}
                className="text-primary underline-offset-4 hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
