import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MessageSquare, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/core/components/ui/button';
import { Alert, AlertDescription } from '@/core/components/ui/alert';
import {
  notificationPreferencesSchema,
  type NotificationPreferencesFormData,
} from '../../domain/schemas/notification-preferences.schema';
import { useUpdateNotificationPreferences } from '../../domain/hooks/notification-preferences.hook';
import NotificationChannelCard from './NotificationChannelCard';

const DEFAULT_VALUES: NotificationPreferencesFormData = {
  email: {
    bookingConfirmation: true,
    reminders: true,
    marketing: false,
  },
  sms: {
    bookingConfirmation: true,
    reminders: false,
  },
};

export default function NotificationPreferencesForm() {
  const {
    updatePreferences,
    updatePreferencesIsPending,
    updatePreferencesIsSuccess,
    updatePreferencesError,
  } = useUpdateNotificationPreferences();

  const form = useForm<NotificationPreferencesFormData>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { watch, setValue, handleSubmit } = form;
  const values = watch();

  const onSubmit = (data: NotificationPreferencesFormData) => {
    updatePreferences(data);
  };

  const emailItems = [
    {
      id: 'email-booking-confirmation',
      label: 'Confirmation de réservation',
      description: 'Recevez un email à chaque nouvelle réservation confirmée.',
      checked: values.email.bookingConfirmation,
      onChange: (checked: boolean) =>
        setValue('email.bookingConfirmation', checked),
    },
    {
      id: 'email-reminders',
      label: 'Rappels',
      description: 'Recevez un rappel par email la veille de votre activité.',
      checked: values.email.reminders,
      onChange: (checked: boolean) => setValue('email.reminders', checked),
    },
    {
      id: 'email-marketing',
      label: 'Offres et nouveautés',
      description: 'Restez informé des nouvelles activités et promotions.',
      checked: values.email.marketing,
      onChange: (checked: boolean) => setValue('email.marketing', checked),
    },
  ];

  const smsItems = [
    {
      id: 'sms-booking-confirmation',
      label: 'Confirmation de réservation',
      description: 'Recevez un SMS à chaque nouvelle réservation confirmée.',
      checked: values.sms.bookingConfirmation,
      onChange: (checked: boolean) =>
        setValue('sms.bookingConfirmation', checked),
    },
    {
      id: 'sms-reminders',
      label: 'Rappels',
      description: 'Recevez un SMS de rappel la veille de votre activité.',
      checked: values.sms.reminders,
      onChange: (checked: boolean) => setValue('sms.reminders', checked),
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.08 } },
        }}
        className="space-y-4"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3 }}
        >
          <NotificationChannelCard
            title="Email"
            icon={<Mail className="h-4 w-4 text-primary" />}
            items={emailItems}
          />
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3 }}
        >
          <NotificationChannelCard
            title="SMS"
            icon={<MessageSquare className="h-4 w-4 text-primary" />}
            items={smsItems}
          />
        </motion.div>
      </motion.div>

      {updatePreferencesIsSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Alert className="border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Vos préférences ont été enregistrées avec succès.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {updatePreferencesError && (
        <Alert variant="destructive">
          <AlertDescription>
            Une erreur est survenue. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={updatePreferencesIsPending}
      >
        {updatePreferencesIsPending
          ? 'Enregistrement...'
          : 'Enregistrer mes préférences'}
      </Button>
    </form>
  );
}
