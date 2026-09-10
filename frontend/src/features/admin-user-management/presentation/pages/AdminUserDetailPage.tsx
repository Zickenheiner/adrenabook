import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/core/components/ui/card';
import { Separator } from '@/core/components/ui/separator';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/core/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/core/components/ui/dialog';
import { useState } from 'react';
import {
  useAdminUsers,
  useUpdateUserStatus,
} from '../../domain/hooks/admin-user.hook';
import AdminUserStatusBadge from '../components/AdminUserStatusBadge';
import AdminUserStatusForm from '../components/AdminUserStatusForm';
import type { UpdateUserStatusFormData } from '../../domain/schemas/admin-user.schema';
import routes from '@/core/constants/routes';

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch first page to find the user — in a real scenario there would be a getById endpoint
  const { adminUsers, adminUsersIsLoading, adminUsersError } = useAdminUsers(
    1,
    100,
  );
  const {
    updateUserStatus,
    updateUserStatusIsPending,
    updateUserStatusIsSuccess,
  } = useUpdateUserStatus();

  const user = adminUsers?.data.find((u) => u.id === id);

  const handleStatusUpdate = (data: UpdateUserStatusFormData) => {
    if (!id) return;
    updateUserStatus(
      { id, data },
      {
        onSuccess: () => {
          setDialogOpen(false);
        },
      },
    );
  };

  if (adminUsersIsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="h-8 w-32 rounded bg-muted animate-pulse" />
          <div className="h-64 w-full rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (adminUsersError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-6">
        <div className="mx-auto max-w-2xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Impossible de charger les informations de l'utilisateur.
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(routes.adminUserList)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-6">
        <div className="mx-auto max-w-2xl">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Utilisateur introuvable</AlertTitle>
            <AlertDescription>
              Aucun utilisateur trouvé avec cet identifiant.
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(routes.adminUserList)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(routes.adminUserList)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </motion.div>

        {/* User card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {user.firstName} {user.lastName}
                    </CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
                <AdminUserStatusBadge status={user.status} />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Rôle</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Inscrit le</p>
                  <p className="font-medium">
                    {user.createdAt.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Identifiant</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {user.id}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Success feedback */}
              {updateUserStatusIsSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert className="border-emerald-500/30 bg-emerald-500/10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <AlertTitle className="text-emerald-700">
                      Statut mis à jour
                    </AlertTitle>
                    <AlertDescription className="text-emerald-600">
                      Le statut de l'utilisateur a été modifié avec succès.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex justify-end">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Modifier le statut</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        Modifier le statut de {user.firstName} {user.lastName}
                      </DialogTitle>
                    </DialogHeader>
                    <AdminUserStatusForm
                      currentStatus={user.status}
                      onSubmit={handleStatusUpdate}
                      isPending={updateUserStatusIsPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
