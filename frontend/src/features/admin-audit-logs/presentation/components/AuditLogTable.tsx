import { motion } from 'motion/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/core/components/ui/tooltip';
import { Badge } from '@/core/components/ui/badge';
import { cn } from '@/core/utils/cn';
import type { AuditLogEntity } from '../../domain/entities/audit-log.entity';
import AuditLogSeverityBadge from './AuditLogSeverityBadge';

const ACTION_TYPE_LABELS: Record<string, string> = {
  'auth.login': 'Connexion réussie',
  'auth.login_failed': 'Connexion échouée',
  'user.status_changed': 'Statut modifié',
  'center.reviewed': 'Centre examiné',
  'data.deleted': 'Données supprimées',
  'payment.refunded': 'Paiement remboursé',
};

const ACTION_TYPE_COLORS: Record<string, string> = {
  'auth.login':
    'bg-green-500/10 text-green-600 border-green-200 dark:text-green-400',
  'auth.login_failed':
    'bg-red-500/10 text-red-600 border-red-200 dark:text-red-400',
  'user.status_changed':
    'bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400',
  'center.reviewed':
    'bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400',
  'data.deleted': 'bg-destructive/10 text-destructive border-destructive/20',
  'payment.refunded':
    'bg-purple-500/10 text-purple-600 border-purple-200 dark:text-purple-400',
};

interface SortConfig {
  key: keyof AuditLogEntity;
  direction: 'asc' | 'desc';
}

interface Props {
  items: AuditLogEntity[];
  sortConfig?: SortConfig;
  onSort?: (key: keyof AuditLogEntity) => void;
}

function SortIcon({
  column,
  sortConfig,
}: {
  column: keyof AuditLogEntity;
  sortConfig?: SortConfig;
}) {
  if (!sortConfig || sortConfig.key !== column) return null;
  return sortConfig.direction === 'asc' ? (
    <ChevronUp className="ml-1 inline h-3 w-3" />
  ) : (
    <ChevronDown className="ml-1 inline h-3 w-3" />
  );
}

function HashDisplay({ hash }: { hash: string }) {
  const short = hash.slice(0, 8) + '…';
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex cursor-default items-center gap-1 font-mono text-xs text-muted-foreground">
            <Shield className="h-3 w-3 text-green-500" />
            {short}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs break-all font-mono text-xs"
        >
          {hash}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function AuditLogTable({ items, sortConfig, onSort }: Props) {
  const thClass = (_col: keyof AuditLogEntity) =>
    cn(
      'text-xs font-semibold text-muted-foreground select-none',
      onSort && 'cursor-pointer hover:text-foreground transition-colors',
    );

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead
              className={thClass('timestamp')}
              onClick={() => onSort?.('timestamp')}
            >
              Horodatage
              <SortIcon column="timestamp" sortConfig={sortConfig} />
            </TableHead>
            <TableHead
              className={thClass('actorId')}
              onClick={() => onSort?.('actorId')}
            >
              Acteur
            </TableHead>
            <TableHead className={thClass('actionType')}>Action</TableHead>
            <TableHead className={thClass('targetType')}>Cible</TableHead>
            <TableHead
              className={thClass('severity')}
              onClick={() => onSort?.('severity')}
            >
              Sévérité
              <SortIcon column="severity" sortConfig={sortConfig} />
            </TableHead>
            <TableHead className={thClass('ipAddress')}>IP</TableHead>
            <TableHead className={thClass('integrityHash')}>Hash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((log, i) => (
            <motion.tr
              key={log.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="group border-b transition-colors hover:bg-muted/40 last:border-0"
            >
              <TableCell className="py-3 text-xs tabular-nums text-muted-foreground">
                {format(log.timestamp, 'dd MMM yyyy HH:mm:ss', { locale: fr })}
              </TableCell>

              <TableCell className="py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="max-w-[140px] truncate font-mono text-xs">
                    {log.actorId}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {log.actorRole}
                  </span>
                </div>
              </TableCell>

              <TableCell className="py-3">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs font-medium',
                    ACTION_TYPE_COLORS[log.actionType] ??
                      'bg-muted text-muted-foreground',
                  )}
                >
                  {ACTION_TYPE_LABELS[log.actionType] ?? log.actionType}
                </Badge>
              </TableCell>

              <TableCell className="py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium">{log.targetType}</span>
                  <span className="max-w-[120px] truncate font-mono text-xs text-muted-foreground">
                    {log.targetId}
                  </span>
                </div>
              </TableCell>

              <TableCell className="py-3">
                <AuditLogSeverityBadge severity={log.severity} />
              </TableCell>

              <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                {log.ipAddress}
              </TableCell>

              <TableCell className="py-3">
                <HashDisplay hash={log.integrityHash} />
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
