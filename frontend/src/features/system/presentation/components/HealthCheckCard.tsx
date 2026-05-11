import { motion } from 'motion/react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { cn } from '@/core/utils/cn';
import {
  CheckCircle2,
  XCircle,
  Database,
  Mail,
  CreditCard,
  Network,
} from 'lucide-react';
import type {
  HealthCheckState,
  HealthChecksEntity,
} from '../../domain/entities/health.entity';

type CheckKey = keyof HealthChecksEntity;

interface Props {
  name: CheckKey;
  state: HealthCheckState;
}

const CHECK_META: Record<
  CheckKey,
  { label: string; description: string; icon: typeof Database }
> = {
  mongodb: {
    label: 'MongoDB',
    description: 'Base de données principale',
    icon: Database,
  },
  rabbitmq: {
    label: 'RabbitMQ',
    description: 'Bus de messages asynchrones',
    icon: Network,
  },
  stripe: {
    label: 'Stripe',
    description: 'Service de paiement',
    icon: CreditCard,
  },
  sendgrid: {
    label: 'SendGrid',
    description: 'Envoi de mails transactionnels',
    icon: Mail,
  },
};

export default function HealthCheckCard({ name, state }: Props) {
  const meta = CHECK_META[name];
  const Icon = meta.icon;
  const isOk = state === 'ok';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card
        className={cn(
          'relative overflow-hidden border transition-colors',
          isOk ? 'border-emerald-500/30' : 'border-destructive/40',
        )}
      >
        <span
          className={cn(
            'absolute inset-x-0 top-0 h-1',
            isOk ? 'bg-emerald-500' : 'bg-destructive',
          )}
          aria-hidden="true"
        />
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full',
                  isOk
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-destructive/15 text-destructive',
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <CardTitle className="text-base">{meta.label}</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {meta.description}
                </p>
              </div>
            </div>
            {isOk ? (
              <CheckCircle2
                className="h-5 w-5 text-emerald-500"
                aria-label="ok"
              />
            ) : (
              <XCircle
                className="h-5 w-5 text-destructive"
                aria-label="échec"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p
            className={cn(
              'text-xs font-medium uppercase tracking-wide',
              isOk
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-destructive',
            )}
          >
            {isOk ? 'Connexion saine' : 'Indisponible'}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
