import { motion } from 'motion/react';
import { HeartPulse } from 'lucide-react';
import { Separator } from '@/core/components/ui/separator';
import PrivacyNotice from '../components/PrivacyNotice';
import HealthProfileForm from '../components/HealthProfileForm';

export default function HealthProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <HeartPulse className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Profil santé</h1>
            <p className="text-sm text-muted-foreground">
              Vos données médicales et contact d&apos;urgence
            </p>
          </div>
        </motion.div>

        {/* Privacy notice */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <PrivacyNotice />
        </motion.div>

        <Separator />

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <HealthProfileForm />
        </motion.div>
      </div>
    </div>
  );
}
