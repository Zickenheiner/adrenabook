import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, LockKeyhole } from 'lucide-react';
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
import { Button } from '@/core/components/ui/button';
import routes from '@/core/constants/routes';
import { ApiError } from '@/core/errors/api.error';
import PasswordResetConfirmForm from '../components/PasswordResetConfirmForm';
import PasswordResetConfirmSuccess from '../components/PasswordResetConfirmSuccess';
import { usePasswordResetConfirm } from '../../domain/hooks/password-reset-confirm.hook';
import type { PasswordResetConfirmFormData } from '../../domain/schemas/password-reset-confirm.schema';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return 'Le lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.';
    }
    return (
      error.message ||
      'Une erreur est survenue lors de la réinitialisation du mot de passe.'
    );
  }
  if (error instanceof Error) return error.message;
  return 'Une erreur inattendue est survenue.';
};

export default function PasswordResetConfirmPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const {
    passwordResetConfirm,
    passwordResetConfirmIsLoading,
    passwordResetConfirmIsSuccess,
    passwordResetConfirmError,
  } = usePasswordResetConfirm();

  const handleSubmit = (data: PasswordResetConfirmFormData) => {
    passwordResetConfirm({
      token,
      newPassword: data.newPassword,
    });
  };

  const errorMessage = passwordResetConfirmError
    ? getErrorMessage(passwordResetConfirmError)
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
              <LockKeyhole
                className="h-6 w-6 text-primary"
                aria-hidden="true"
              />
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl">
                Nouveau mot de passe
              </CardTitle>
              <CardDescription className="mt-2">
                Choisissez un nouveau mot de passe sécurisé pour votre compte
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!token && !passwordResetConfirmIsSuccess && (
              <Alert variant="destructive" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Lien invalide</AlertTitle>
                <AlertDescription>
                  Le lien de réinitialisation est incomplet ou manquant.
                  Veuillez recommencer la procédure.
                </AlertDescription>
              </Alert>
            )}

            {errorMessage && !passwordResetConfirmIsSuccess && (
              <Alert variant="destructive" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Réinitialisation impossible</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {passwordResetConfirmIsSuccess ? (
              <PasswordResetConfirmSuccess />
            ) : token ? (
              <>
                <PasswordResetConfirmForm
                  onSubmit={handleSubmit}
                  isSubmitting={passwordResetConfirmIsLoading}
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
            ) : (
              <Button asChild className="w-full">
                <Link to={routes.passwordResetRequest}>
                  Demander un nouveau lien
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
