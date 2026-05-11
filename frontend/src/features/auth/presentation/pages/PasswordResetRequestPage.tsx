import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, KeyRound } from 'lucide-react';
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
import PasswordResetRequestForm from '../components/PasswordResetRequestForm';
import PasswordResetRequestSuccess from '../components/PasswordResetRequestSuccess';
import { usePasswordResetRequest } from '../../domain/hooks/password-reset-request.hook';
import type { PasswordResetRequestFormData } from '../../domain/schemas/password-reset-request.schema';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return 'Certaines informations sont invalides. Vérifiez votre email et réessayez.';
    }
    return (
      error.message || 'Une erreur est survenue lors de l’envoi de la demande.'
    );
  }
  if (error instanceof Error) return error.message;
  return 'Une erreur inattendue est survenue.';
};

export default function PasswordResetRequestPage() {
  const {
    passwordResetRequestAsync,
    passwordResetRequestIsLoading,
    passwordResetRequestIsSuccess,
    passwordResetRequestError,
  } = usePasswordResetRequest();
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (data: PasswordResetRequestFormData) => {
    try {
      await passwordResetRequestAsync({ email: data.email });
      setSubmittedEmail(data.email);
    } catch {
      // L'erreur est exposée via passwordResetRequestError ci-dessous
    }
  };

  const errorMessage = passwordResetRequestError
    ? getErrorMessage(passwordResetRequestError)
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl">
                Mot de passe oublié ?
              </CardTitle>
              <CardDescription className="mt-2">
                Saisissez votre email pour recevoir un lien de réinitialisation
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMessage && !passwordResetRequestIsSuccess && (
              <Alert variant="destructive" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Demande impossible</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {passwordResetRequestIsSuccess ? (
              <PasswordResetRequestSuccess email={submittedEmail} />
            ) : (
              <>
                <PasswordResetRequestForm
                  onSubmit={handleSubmit}
                  isSubmitting={passwordResetRequestIsLoading}
                />

                <p className="text-center text-sm text-muted-foreground">
                  Vous vous souvenez de votre mot de passe ?{' '}
                  <Link
                    to={routes.login}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Se connecter
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
