import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/core/components/ui/button';

interface Props {
  onGoHome: () => void;
}

export default function ProfessionalRegistrationSuccess({ onGoHome }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center gap-6 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Dossier enregistré</h2>
        <p className="text-muted-foreground">
          Votre demande d&apos;inscription en tant que centre professionnel a
          bien été enregistrée. Elle sera examinée par un administrateur.
        </p>
      </div>

      <Button onClick={onGoHome} className="w-full">
        Retour à l&apos;accueil
      </Button>
    </motion.div>
  );
}
