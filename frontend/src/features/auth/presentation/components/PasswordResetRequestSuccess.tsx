import { motion } from 'motion/react';
import { MailCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/core/components/ui/button';
import routes from '@/core/constants/routes';

interface Props {
  email: string;
}

export default function PasswordResetRequestSuccess({ email }: Props) {
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
        <MailCheck className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Vérifiez votre boîte mail</h2>
        <p className="text-sm text-muted-foreground">
          Si un compte est associé à{' '}
          <span className="font-medium text-foreground">{email}</span>, vous
          recevrez un lien de réinitialisation valable 1 heure.
        </p>
        <p className="text-xs text-muted-foreground">
          Pensez à vérifier vos courriers indésirables. Le lien est à usage
          unique.
        </p>
      </div>
      <Button asChild variant="outline" className="w-full">
        <Link to={routes.login}>Retour à la connexion</Link>
      </Button>
    </motion.div>
  );
}
