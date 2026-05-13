import { motion } from 'motion/react';

interface Props {
  firstName: string;
}

export default function DashboardWelcomeHeader({ firstName }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-1"
    >
      <h1 className="text-3xl font-bold tracking-tight">
        Bonjour, {firstName} 👋
      </h1>
      <p className="text-muted-foreground text-base">
        Prêt pour votre prochaine aventure ?
      </p>
    </motion.div>
  );
}
