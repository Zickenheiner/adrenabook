import { motion } from 'motion/react';
import { Bell } from 'lucide-react';
import NotificationPreferencesForm from '../components/NotificationPreferencesForm';

export default function NotificationPreferencesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto max-w-lg px-4 py-12"
    >
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos préférences de notifications par email et SMS.
          </p>
        </div>
      </div>

      <NotificationPreferencesForm />
    </motion.div>
  );
}
