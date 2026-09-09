import { CheckCircle2, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/core/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';

interface Props {
  email: string;
  onGoToLogin: () => void;
}

export default function RegisterSuccess({ email, onGoToLogin }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="border-green-200 bg-green-50/40 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40"
          >
            <CheckCircle2
              className="h-8 w-8 text-green-600 dark:text-green-400"
              aria-hidden="true"
            />
          </motion.div>
          <CardTitle className="text-2xl">Compte créé avec succès</CardTitle>
          <CardDescription>
            Bienvenue dans l’aventure AdrenaBook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border bg-background p-4">
            <UserCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Votre compte est actif</p>
              <p className="text-muted-foreground">
                Aucune étape de vérification n’est nécessaire : connectez-vous
                dès maintenant avec{' '}
                <span className="font-medium text-foreground">{email}</span> et
                votre mot de passe.
              </p>
            </div>
          </div>

          <Button onClick={onGoToLogin} className="w-full" size="lg">
            Aller à la page de connexion
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
