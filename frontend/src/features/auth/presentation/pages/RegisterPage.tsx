import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import RegisterForm from '../components/RegisterForm';
import RegisterSuccess from '../components/RegisterSuccess';
import { useRegister } from '../../domain/hooks/register.hook';
import type { RegisterFormData } from '../../domain/schemas/register.schema';
import type { RegisterEntity } from '../../domain/entities/register.entity';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return 'Un compte existe déjà avec cet email. Essayez de vous connecter.';
    }
    if (error.status === 400) {
      return 'Certaines informations sont invalides. Vérifiez vos données et réessayez.';
    }
    return error.message || 'Une erreur est survenue lors de l’inscription.';
  }
  if (error instanceof Error) return error.message;
  return 'Une erreur inattendue est survenue.';
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerAsync, registerIsLoading, registerError } = useRegister();
  const [successData, setSuccessData] = useState<RegisterEntity | null>(null);

  const handleSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerAsync({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate,
        acceptCgu: data.acceptCgu,
        acceptRgpd: data.acceptRgpd,
      });
      setSuccessData(result);
    } catch {
      // L'erreur est gérée via registerError (TanStack Query)
    }
  };

  if (successData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/40 p-4">
        <div className="w-full max-w-md">
          <RegisterSuccess
            email={successData.email}
            onGoToLogin={() => navigate(routes.login)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-xl"
      >
        <Card className="shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mountain className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <CardTitle as="h1" className="text-2xl sm:text-3xl">
                Créer un compte aventurier
              </CardTitle>
              <CardDescription className="mt-2">
                Rejoignez AdrenaBook pour réserver vos prochaines aventures
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {registerError && (
              <Alert variant="destructive" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Inscription impossible</AlertTitle>
                <AlertDescription>
                  {getErrorMessage(registerError)}
                </AlertDescription>
              </Alert>
            )}

            <RegisterForm
              onSubmit={handleSubmit}
              isSubmitting={registerIsLoading}
            />

            <p className="text-center text-sm text-muted-foreground">
              Vous avez déjà un compte ?{' '}
              <Link
                to={routes.login}
                className="font-medium text-link underline-offset-4 hover:underline"
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
