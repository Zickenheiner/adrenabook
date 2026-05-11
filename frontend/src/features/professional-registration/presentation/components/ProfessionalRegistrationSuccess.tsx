import { motion } from 'motion/react';
import { CheckCircle2, Clock, FileSearch } from 'lucide-react';
import { Button } from '@/core/components/ui/button';

interface Props {
  centerId: string;
  estimatedReviewTime: string;
  onGoHome: () => void;
}

export default function ProfessionalRegistrationSuccess({
  centerId,
  estimatedReviewTime,
  onGoHome,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center gap-6 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Dossier soumis avec succès !</h2>
        <p className="text-muted-foreground">
          Votre demande d'inscription en tant que centre professionnel a bien
          été reçue.
        </p>
      </div>

      <div className="w-full space-y-3 rounded-lg border bg-muted/40 p-4 text-left">
        <div className="flex items-start gap-3">
          <FileSearch className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Référence du dossier
            </p>
            <p className="font-mono text-sm">{centerId}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Délai de traitement estimé
            </p>
            <p className="text-sm">{estimatedReviewTime}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Vous recevrez un email de confirmation à l'adresse fournie dès
        validation de votre dossier.
      </p>

      <Button onClick={onGoHome} className="w-full">
        Retour à l'accueil
      </Button>
    </motion.div>
  );
}
