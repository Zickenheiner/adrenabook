import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, AlertCircle, Inbox } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table';
import { Skeleton } from '@/core/components/ui/skeleton';
import { Button } from '@/core/components/ui/button';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/core/components/ui/alert';
import { useAdminUsers } from '../../domain/hooks/admin-user.hook';
import AdminUserRow from '../components/AdminUserRow';

function AdminUserListSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminUserListError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-6">
      <div className="mx-auto max-w-5xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            Impossible de récupérer la liste des utilisateurs.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminUserListEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3 py-20 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Inbox className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="font-medium">Aucun utilisateur trouvé</p>
      <p className="text-sm text-muted-foreground">
        Il n'y a pas d'utilisateurs pour cette page.
      </p>
    </motion.div>
  );
}

export default function AdminUserListPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { adminUsers, adminUsersIsLoading, adminUsersError } = useAdminUsers(
    page,
    limit,
  );

  if (adminUsersIsLoading) return <AdminUserListSkeleton />;
  if (adminUsersError) return <AdminUserListError />;

  const users = adminUsers?.data ?? [];
  const meta = adminUsers?.meta;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Gestion des utilisateurs
            </h1>
            <p className="text-sm text-muted-foreground">
              {meta
                ? `${meta.total} utilisateur${meta.total > 1 ? 's' : ''}`
                : 'Back-office admin'}
            </p>
          </div>
        </motion.div>

        {/* Content */}
        {users.length === 0 ? (
          <AdminUserListEmpty />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-xl border bg-card shadow-sm overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, i) => (
                  <AdminUserRow key={user.id} user={user} index={i} />
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <p className="text-sm text-muted-foreground">
              Page {meta.page} sur {meta.totalPages}
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
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.totalPages}
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
