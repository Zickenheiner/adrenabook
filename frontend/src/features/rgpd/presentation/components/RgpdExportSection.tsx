import { motion } from 'motion/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import { Alert, AlertDescription } from '@/core/components/ui/alert';
import { Download, Loader2, FileJson, Info } from 'lucide-react';
import type { RgpdExportEntity } from '../../domain/entities/rgpd.entity';

interface Props {
  onRequestExport: () => void;
  isPending: boolean;
  exportData?: RgpdExportEntity;
  error: Error | null;
}

function StatusBadge({ status }: { status: RgpdExportEntity['status'] }) {
  const config = {
    queued: { label: 'En attente', variant: 'secondary' as const },
    processing: { label: 'En cours', variant: 'default' as const },
    ready: { label: 'Prêt', variant: 'default' as const },
  } satisfies Record<
    RgpdExportEntity['status'],
    { label: string; variant: 'secondary' | 'default' }
  >;

  return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
}

export default function RgpdExportSection({
  onRequestExport,
  isPending,
  exportData,
  error,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-primary" />
            <CardTitle>Export de mes données</CardTitle>
          </div>
          <CardDescription>
            Téléchargez toutes vos données personnelles (profil, réservations,
            factures, avis) au format JSON et PDF, conformément au RGPD.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              La préparation de votre export peut prendre jusqu'à 30 jours. Vous
              recevrez un email dès qu'il sera disponible.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                Une erreur est survenue lors de la demande d'export. Veuillez
                réessayer.
              </AlertDescription>
            </Alert>
          )}

          {exportData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Statut de la demande
                </span>
                <StatusBadge status={exportData.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                Disponible estimé le :{' '}
                {exportData.estimatedReadyAt.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              {exportData.status === 'ready' && exportData.downloadUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={exportData.downloadUrl} download>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </a>
                </Button>
              )}
            </motion.div>
          )}

          <Button
            onClick={onRequestExport}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Demande en cours…
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Demander l'export de mes données
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
