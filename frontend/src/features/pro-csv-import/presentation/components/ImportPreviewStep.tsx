import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Progress } from '@/core/components/ui/progress';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/core/components/ui/alert';
import { Badge } from '@/core/components/ui/badge';
import type { CsvImportEntity } from '../../domain/entities/csv-import.entity';
import type { EntityType } from './CsvUploadStep';

interface Props {
  entityType: EntityType;
  fileId: string;
  columnMapping: Record<string, string>;
  dryRunResult: CsvImportEntity | null;
  isLoading: boolean;
  onRunDryRun: () => void;
  onConfirmImport: () => void;
  onBack: () => void;
}

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  slots: 'Créneaux',
  customers: 'Clients',
  activities: 'Activités',
};

export default function ImportPreviewStep({
  entityType,
  columnMapping,
  dryRunResult,
  isLoading,
  onRunDryRun,
  onConfirmImport,
  onBack,
}: Props) {
  const mappedFields = Object.entries(columnMapping).filter(
    ([, v]) => v && v !== '__ignore__',
  );

  const successRate =
    dryRunResult && dryRunResult.rowsTotal > 0
      ? Math.round((dryRunResult.rowsSuccess / dryRunResult.rowsTotal) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Résumé du mapping */}
      <div className="rounded-md border bg-muted/40 p-4 space-y-2">
        <p className="text-sm font-medium">
          Type : {ENTITY_TYPE_LABELS[entityType]}
        </p>
        <div className="flex flex-wrap gap-2">
          {mappedFields.map(([target, csv]) => (
            <Badge key={target} variant="secondary" className="text-xs">
              {target} → {csv}
            </Badge>
          ))}
        </div>
      </div>

      {/* Bouton Dry-run */}
      {!dryRunResult && (
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Lancez une simulation pour vérifier les données avant l'import réel.
          </p>
          <Button onClick={onRunDryRun} disabled={isLoading} variant="outline">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Simulation en cours…
              </>
            ) : (
              'Lancer la simulation (dry-run)'
            )}
          </Button>
        </div>
      )}

      {/* Résultat dry-run */}
      {dryRunResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {dryRunResult.rowsSuccess} / {dryRunResult.rowsTotal} lignes
                valides
              </span>
              <span className="font-medium">{successRate}%</span>
            </div>
            <Progress value={successRate} className="h-2" />
          </div>

          {dryRunResult.rowsErrors > 0 ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {dryRunResult.rowsErrors} ligne(s) avec des erreurs
              </AlertTitle>
              <AlertDescription>
                Consultez le rapport détaillé à l'étape suivante ou corrigez
                votre fichier avant d'importer.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Simulation réussie</AlertTitle>
              <AlertDescription>
                Toutes les lignes sont valides. Vous pouvez procéder à l'import.
              </AlertDescription>
            </Alert>
          )}
        </motion.div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={onConfirmImport} disabled={!dryRunResult || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Import en cours…
            </>
          ) : (
            <span>Lancer l&apos;import réel</span>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
