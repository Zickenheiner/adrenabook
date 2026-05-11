import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/core/components/ui/button';
import routes from '@/core/constants/routes';

export default function PasswordResetConfirmSuccess() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center gap-4 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Mot de passe réinitialisé</h2>
        <p className="text-sm text-muted-foreground">
          Votre mot de passe a été mis à jour avec succès. Vos sessions
          précédentes ont été invalidées pour votre sécurité.
        </p>
      </div>
      <Button asChild className="w-full">
        <Link to={routes.login}>Se connecter</Link>
      </Button>
    </motion.div>
  );
}
