import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, Lock, Mountain } from 'lucide-react';
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
import LoginForm from '../components/LoginForm';
import { useLogin } from '../../domain/hooks/login.hook';
import type { LoginFormData } from '../../domain/schemas/login.schema';

interface LocationState {
  from?: { pathname?: string };
}

const TWO_FACTOR_HINT = '2fa';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      const message = (error.message ?? '').toLowerCase();
      if (message.includes(TWO_FACTOR_HINT)) {
        return 'Un code de vérification 2FA est requis pour ce compte. Saisissez le code reçu par email.';
      }
      return 'Identifiants invalides. Vérifiez votre email et votre mot de passe.';
    }
    if (error.status === 400) {
      return 'Certaines informations sont invalides. Vérifiez vos données et réessayez.';
    }
    if (error.status === 423) {
      return 'Votre compte est temporairement verrouillé après plusieurs tentatives échouées. Réessayez dans 15 minutes.';
    }
    return error.message || 'Une erreur est survenue lors de la connexion.';
  }
  if (error instanceof Error) return error.message;
  return 'Une erreur inattendue est survenue.';
};

const isTwoFactorError = (error: unknown): boolean => {
  if (!(error instanceof ApiError)) return false;
  if (error.status !== 401) return false;
  const message = (error.message ?? '').toLowerCase();
  return message.includes(TWO_FACTOR_HINT);
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsync, loginIsLoading, loginError } = useLogin();
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  const handleSubmit = async (data: LoginFormData) => {
    try {
      await loginAsync({
        email: data.email,
        password: data.password,
        twoFactorCode: data.twoFactorCode?.trim()
          ? data.twoFactorCode.trim()
          : undefined,
      });
      const state = location.state as LocationState | null;
      const redirectTo = state?.from?.pathname ?? routes.home;
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (isTwoFactorError(error)) {
        setTwoFactorRequired(true);
      }
    }
  };

  const errorMessage = loginError ? getErrorMessage(loginError) : null;
  const isAccountLocked =
    loginError instanceof ApiError && loginError.status === 423;

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
              <Mountain className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <CardTitle as="h1" className="text-2xl sm:text-3xl">
                Connexion à AdrenaBook
              </CardTitle>
              <CardDescription className="mt-2">
                Accédez à votre compte pour gérer vos aventures
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMessage && (
              <Alert
                variant={isAccountLocked ? 'default' : 'destructive'}
                role="alert"
              >
                {isAccountLocked ? (
                  <Lock className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                )}
                <AlertTitle>
                  {isAccountLocked
                    ? 'Compte temporairement verrouillé'
                    : 'Connexion impossible'}
                </AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <LoginForm
              onSubmit={handleSubmit}
              isSubmitting={loginIsLoading}
              twoFactorRequired={twoFactorRequired}
            />

            <div className="space-y-3 text-center text-sm">
              <p>
                <Link
                  to={routes.passwordResetRequest}
                  className="font-medium text-link underline-offset-4 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </p>
              <p className="text-muted-foreground">
                Pas encore de compte ?{' '}
                <Link
                  to={routes.register}
                  className="font-medium text-link underline-offset-4 hover:underline"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
