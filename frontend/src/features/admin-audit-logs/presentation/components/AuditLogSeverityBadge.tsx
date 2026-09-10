import { Badge } from '@/core/components/ui/badge';
import { cn } from '@/core/utils/cn';
import type { AuditLogSeverity } from '../../data/dtos/audit-log.dto';

interface Props {
  severity: AuditLogSeverity;
}

const SEVERITY_CONFIG: Record<
  AuditLogSeverity,
  { label: string; className: string }
> = {
  info: {
    label: 'Info',
    className:
      'bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400',
  },
  warning: {
    label: 'Avertissement',
    className:
      'bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400',
  },
  critical: {
    label: 'Critique',
    className: 'bg-red-500/10 text-red-600 border-red-200 dark:text-red-400',
  },
};

export default function AuditLogSeverityBadge({ severity }: Props) {
  const config = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.info;

  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium capitalize', config.className)}
    >
      {config.label}
    </Badge>
  );
}
