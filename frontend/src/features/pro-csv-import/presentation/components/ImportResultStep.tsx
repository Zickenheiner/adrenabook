import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/core/components/ui/alert';
import { Progress } from '@/core/components/ui/progress';
import type { CsvImportEntity } from '../../domain/entities/csv-import.entity';

interface Props {
  result: CsvImportEntity;
  onReset: () => void;
}

const STATUS_LABELS: Record<CsvImportEntity['status'], string> = {
  queued: 'En attente',
  processing: 'En cours',
  completed: 'Terminé',
  failed: 'Échoué',
};

const STATUS_VARIANTS: Record<
  CsvImportEntity['status'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  queued: 'secondary',
  processing: 'outline',
  completed: 'default',
  failed: 'destructive',
};

export default function ImportResultStep({ result, onReset }: Props) {
  const successRate =
    result.rowsTotal > 0
      ? Math.round((result.rowsSuccess / result.rowsTotal) * 100)
      : 0;

  const hasErrors = result.errors.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* En-tête résultat */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {result.status === 'completed' && !hasErrors ? (
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          ) : (
            <AlertCircle className="h-8 w-8 text-destructive" />
          )}
          <div>
            <p className="font-semibold text-lg">Rapport d'import</p>
            <p className="text-sm text-muted-foreground">
              Job : {result.importJobId}
            </p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANTS[result.status]}>
          {STATUS_LABELS[result.status]}
        </Badge>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="text-2xl font-bold">{result.rowsTotal}</p>
          <p className="text-xs text-muted-foreground mt-1">Total</p>
        </div>
        <div className="rounded-lg border bg-green-500/10 p-4">
          <p className="text-2xl font-bold text-green-600">
            {result.rowsSuccess}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Importées</p>
        </div>
        <div className="rounded-lg border bg-destructive/10 p-4">
          <p className="text-2xl font-bold text-destructive">
            {result.rowsErrors}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Erreurs</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Taux de réussite</span>
          <span>{successRate}%</span>
        </div>
        <Progress value={successRate} className="h-2" />
      </div>

      {/* Alerte globale */}
      {!hasErrors ? (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Import réussi</AlertTitle>
          <AlertDescription>
            Toutes les lignes ont été importées sans erreur.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{result.rowsErrors} ligne(s) en erreur</AlertTitle>
          <AlertDescription>
            Corrigez les lignes listées ci-dessous et relancez un import
            partiel.
          </AlertDescription>
        </Alert>
      )}

      {/* Tableau des erreurs */}
      {hasErrors && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-md border overflow-x-auto"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Ligne</TableHead>
                <TableHead>Colonne</TableHead>
                <TableHead>Raison</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.errors.map((err, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-sm">
                    {err.line}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {err.column}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {err.reason}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}

      {/* Action */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Nouvel import
        </Button>
      </div>
    </motion.div>
  );
}
