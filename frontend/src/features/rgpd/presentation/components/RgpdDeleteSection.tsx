import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Alert, AlertDescription } from '@/core/components/ui/alert';
import { Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { RgpdDeleteEntity } from '../../domain/entities/rgpd.entity';
import type { RgpdDeleteFormData } from '../../domain/schemas/rgpd.schema';
import RgpdDeleteDialog from './RgpdDeleteDialog';

interface Props {
  onRequestDelete: (data: RgpdDeleteFormData) => void;
  isPending: boolean;
  deleteData?: RgpdDeleteEntity;
  error: Error | null;
}

export default function RgpdDeleteSection({
  onRequestDelete,
  isPending,
  deleteData,
  error,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleConfirm(data: RgpdDeleteFormData) {
    onRequestDelete(data);
    setDialogOpen(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">
              Supprimer mon compte
            </CardTitle>
          </div>
          <CardDescription>
            Exercez votre droit à l'effacement conformément au RGPD. Les données
            comptables sont conservées 10 ans par obligation légale.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              La suppression de votre compte est planifiée 30 jours après votre
              demande, permettant une période de rétractation. Cette action
              anonymisera définitivement vos données personnelles.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                Une erreur est survenue lors de la demande de suppression.
                Vérifiez votre code de confirmation et réessayez.
              </AlertDescription>
            </Alert>
          )}

          {deleteData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-destructive/30 p-4 space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-destructive" />
                Demande enregistrée
              </div>
              <p className="text-sm text-muted-foreground">
                Suppression planifiée le :{' '}
                {deleteData.scheduledDeletionAt.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              {deleteData.retainedData.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">
                    Données conservées (obligation légale) :
                  </p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {deleteData.retainedData.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          <Button
            variant="destructive"
            onClick={() => setDialogOpen(true)}
            disabled={isPending || !!deleteData}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Demander la suppression de mon compte
          </Button>

          <RgpdDeleteDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onConfirm={handleConfirm}
            isPending={isPending}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
