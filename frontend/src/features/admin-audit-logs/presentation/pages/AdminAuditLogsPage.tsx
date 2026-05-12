import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Skeleton } from '@/core/components/ui/skeleton';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/core/components/ui/alert';
import { useAuditLogs } from '../../domain/hooks/audit-log.hook';
import type { AuditLogsQueryDto } from '../../data/dtos/audit-log.dto';
import type { AuditLogEntity } from '../../domain/entities/audit-log.entity';
import AuditLogFilters from '../components/AuditLogFilters';
import AuditLogTable from '../components/AuditLogTable';

const PAGE_SIZE = 25;

interface SortConfig {
  key: keyof AuditLogEntity;
  direction: 'asc' | 'desc';
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function PageError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            Impossible de récupérer les journaux d'audit. Vérifiez votre
            connexion ou réessayez.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3 py-20 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Inbox className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="font-medium">Aucun événement trouvé</p>
      <p className="text-sm text-muted-foreground">
        Aucun journal d'audit ne correspond à vos critères de recherche.
      </p>
    </motion.div>
  );
}

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AuditLogsQueryDto>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'timestamp',
    direction: 'desc',
  });

  const query: AuditLogsQueryDto = {
    ...filters,
    page,
    pageSize: PAGE_SIZE,
  };

  const { auditLogs, auditLogsIsLoading, auditLogsError } = useAuditLogs(query);

  const handleFilter = useCallback((newFilters: AuditLogsQueryDto) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleSort = useCallback((key: keyof AuditLogEntity) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  if (auditLogsIsLoading) return <PageSkeleton />;
  if (auditLogsError) return <PageError onRetry={handleRetry} />;

  const items = auditLogs?.items ?? [];
  const total = auditLogs?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Client-side sort (sort applied on current page data)
  const sortedItems = [...items].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    let cmp = 0;
    if (aVal instanceof Date && bVal instanceof Date) {
      cmp = aVal.getTime() - bVal.getTime();
    } else if (typeof aVal === 'string' && typeof bVal === 'string') {
      cmp = aVal.localeCompare(bVal);
    }
    return sortConfig.direction === 'asc' ? cmp : -cmp;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Journal d'audit
              </h1>
              <p className="text-sm text-muted-foreground">
                {total > 0
                  ? `${total} événement${total > 1 ? 's' : ''} enregistré${total > 1 ? 's' : ''}`
                  : 'Traçabilité des actions sensibles'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <AuditLogFilters onFilter={handleFilter} />
        </motion.div>

        {/* Table or Empty */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {sortedItems.length === 0 ? (
            <EmptyState />
          ) : (
            <AuditLogTable
              items={sortedItems}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <p className="text-sm text-muted-foreground">
              Page {page} sur {totalPages} — {total} résultat
              {total > 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Suivant
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
